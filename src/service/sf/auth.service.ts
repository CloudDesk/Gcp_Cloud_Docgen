import jwt from "jsonwebtoken";
import axios, { AxiosError } from "axios";
import fs from "fs/promises";
import path from "path";
import { getSecretValue } from "../gcp/secretManager.service.js";

// Types
type AuthResult = {
  accessToken: string | null;
  instanceUrl: string | null;
  error?: string;
};

type SalesforceConfig = {
  authUrl: string;
  privateKeyPath: string;
};

// Configuration Template
const baseConfig: SalesforceConfig = {
  authUrl: "https://login.salesforce.com/services/oauth2/token",
  privateKeyPath: path.resolve(
    process.env.SF_PRIVATE_KEY_PATH || "privateKey.pem"
  ),
};

// In-memory storage
let privateKeyCache: string | null = null;
let accessTokenCache: string | null = null;
let instanceUrlCache: string | null = null;

/**
 * Retrieves clientId for the given orgId from Google Secret Manager.
 * @param {string} orgId - The organization ID.
 * @returns {Promise<string>} - The clientId retrieved from Google Secret Manager.
 */
const getClientIdFromSecretManager = async (orgId: string): Promise<any> => {
  console.log(orgId, "orgId from getClientIdFromSecretManager");
  try {
    let clientId = await getSecretValue(orgId);
    console.log(clientId, 'clientId from getClientIdFromSecretManager')
    if (typeof clientId === "string") {
      console.log(clientId, "Client ID");
      return clientId;
    } else {
      console.log('inside else condition client id')
      if (clientId.error.code === 5) {
        let errormessage = { success: false, error: 'Given OrgId is Not Exist.Create New orgId with Client Secret For Authentication With Salesforce' }
        console.log(errormessage, 'errormessage')
        return errormessage;
      }
      return clientId.error;
    }
  } catch (error) {
    throw new Error(`Error fetching client ID: ${error.message}`);
  }
};

/**
 * Loads and caches the private key from the file system.
 * @returns {Promise<string>} The private key.
 */
const loadPrivateKey = async (): Promise<string> => {
  if (!privateKeyCache) {
    privateKeyCache = await fs.readFile(baseConfig.privateKeyPath, "utf8");
    console.log(privateKeyCache, "Loading private key from file system");
  } else {
    console.log("Using cached private key");
  }
  return privateKeyCache;
};

/**
 * Generates a JWT token for Salesforce authentication.
 * @param {string} privateKey - The private key to sign the JWT.
 * @param {string} clientId - The client ID for Salesforce.
 * @returns {string} The generated JWT token.
 */
const generateJWT = (
  privateKey: string,
  clientId: string,
  userName: string
): string => {
  const claims = {
    iss: clientId,
    sub: userName,
    aud: "https://login.salesforce.com",
    exp: Math.floor(Date.now() / 1000) + 180, // 3 minutes expiry
  };

  return jwt.sign(claims, privateKey, { algorithm: "RS256" });
};

/**
 * Requests a new access token from Salesforce.
 * @param {string} orgId - The organization ID.
 * @returns {Promise<AuthResult>} The authentication result containing the access token and instance URL.
 */
const requestNewAccessToken = async (
  orgId: string,
  userName: string
): Promise<any> => {
  // console.log(orgId, "orgId from requestNewAccessToken");
  try {
    console.log("inside requestNewAccessToken");
    const clientId: any = await getClientIdFromSecretManager(orgId);
    console.log(clientId, "Client ID from requestNewAccessToken");
    if (clientId.success === false) {
      console.log('inside if condition client id')
      return clientId
    }
    const privateKey = await loadPrivateKey();
    console.log(privateKey, "Private key from requestNewAccessToken");
    const jwtToken = generateJWT(privateKey, clientId, userName);
    console.log(jwtToken, "generated token");
    const params = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    });
    console.log(params, "params");
    console.log(baseConfig.authUrl, "baseConfig.authUrl");
    try {
      const response = await axios.post(baseConfig.authUrl, params);
      console.log(response.data, "response data");
      accessTokenCache = response.data.access_token;
      instanceUrlCache = response.data.instance_url;
    } catch (error) {
      console.log(error.message, "error in requestNewAccessToken");
      if (error.response.data.error_description === 'client identifier invalid') {
        return { success: false, error: `This OrgId's ClientId or User Name is Invalid. Please Update the Correct ClientId for this OrgId And check the userName` };
      }
      else {
        return { success: false, error: error.message };
      }
    }

    return {
      accessToken: accessTokenCache,
      instanceUrl: instanceUrlCache,
    };
  } catch (error) {
    // Clear caches on error
    accessTokenCache = null;
    instanceUrlCache = null;

    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.error_description || error.message
        : "Unknown error occurred";

    return {
      accessToken: null,
      instanceUrl: null,
      error: `Salesforce authentication failed: ${errorMessage}`,
    };
  }
};

/**
 * Gets the current access token or requests a new one if needed.
 * @param {string} orgId - The organization ID.
 * @returns {Promise<AuthResult>} The authentication result containing the access token and instance URL.
 */
const getAccessToken = async (
  orgId?: string,
  userName?: string
): Promise<AuthResult> => {

  return requestNewAccessToken(orgId, userName);

};



export const sfAuthService = {
  getAccessToken,
};
