import jwt from "jsonwebtoken";
import axios, { AxiosError } from "axios";
import fs from "fs/promises";
import path from "path";
import { getSecretValue } from "../gcp/secretManager.service.js";
// Configuration Template
const baseConfig = {
    authUrl: "https://login.salesforce.com/services/oauth2/token",
    privateKeyPath: path.resolve(process.env.SF_PRIVATE_KEY_PATH || "privateKey.pem"),
};
// In-memory storage
let privateKeyCache = null;
let accessTokenCache = null;
let instanceUrlCache = null;
/**
 * Retrieves clientId for the given orgId from Google Secret Manager.
 * @param {string} orgId - The organization ID.
 * @returns {Promise<string>} - The clientId retrieved from Google Secret Manager.
 */
const getClientIdFromSecretManager = async (orgId) => {
    console.log(orgId, "orgId from getClientIdFromSecretManager");
    try {
        let clientId = await getSecretValue(orgId);
        if (typeof clientId === "string") {
            console.log(clientId, "Client ID");
            return clientId;
        }
        else {
            throw new Error(`Failed to fetch client ID: ${clientId.error}`);
        }
    }
    catch (error) {
        console.error("Error fetching client ID:", error);
    }
};
/**
 * Loads and caches the private key from the file system.
 * @returns {Promise<string>} The private key.
 */
const loadPrivateKey = async () => {
    if (!privateKeyCache) {
        privateKeyCache = await fs.readFile(baseConfig.privateKeyPath, "utf8");
    }
    return privateKeyCache;
};
/**
 * Generates a JWT token for Salesforce authentication.
 * @param {string} privateKey - The private key to sign the JWT.
 * @param {string} clientId - The client ID for Salesforce.
 * @returns {string} The generated JWT token.
 */
const generateJWT = (privateKey, clientId, userName) => {
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
const requestNewAccessToken = async (orgId, userName) => {
    console.log(orgId, "orgId from requestNewAccessToken");
    try {
        const clientId = await getClientIdFromSecretManager(orgId);
        const privateKey = await loadPrivateKey();
        const jwtToken = generateJWT(privateKey, clientId, userName);
        console.log(jwtToken, "generated token");
        const params = new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwtToken,
        });
        console.log(params, "params");
        const response = await axios.post(baseConfig.authUrl, params);
        console.log(response.data, "response data");
        accessTokenCache = response.data.access_token;
        instanceUrlCache = response.data.instance_url;
        return {
            accessToken: accessTokenCache,
            instanceUrl: instanceUrlCache,
        };
    }
    catch (error) {
        // Clear caches on error
        accessTokenCache = null;
        instanceUrlCache = null;
        const errorMessage = error instanceof AxiosError
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
const getAccessToken = async (orgId, userName) => {
    if (!accessTokenCache) {
        return requestNewAccessToken(orgId, userName);
    }
    return {
        accessToken: accessTokenCache,
        instanceUrl: instanceUrlCache,
    };
};
/**
 * Clears the current access token and instance URL.
 */
const clearAccessToken = () => {
    accessTokenCache = null;
    instanceUrlCache = null;
};
export const sfAuthService = {
    getAccessToken,
    clearAccessToken,
};
//# sourceMappingURL=auth.service.js.map