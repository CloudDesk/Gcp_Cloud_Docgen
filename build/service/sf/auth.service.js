import jwt from "jsonwebtoken";
import axios, { AxiosError } from "axios";
import fs from "fs/promises";
import path from "path";
import { getSecretValue } from "../gcp/secretManager.service.js";
import qs from 'querystring';
import { SF_CLIENT_SECRET } from "../../config/config.js";
// obj={orgid:'clientid'}
// obj.orgid
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
        console.log(clientId, 'clientId from getClientIdFromSecretManager');
        if (typeof clientId === "string") {
            console.log(clientId, "Client ID");
            return clientId;
        }
        else {
            console.log('inside else condition client id');
            if (clientId.error.code === 5) {
                let errormessage = { success: false, error: 'Given OrgId is Not Exist.Create New orgId with Client Secret For Authentication With Salesforce' };
                console.log(errormessage, 'errormessage');
                return errormessage;
            }
            return clientId.error;
        }
    }
    catch (error) {
        throw new Error(`Error fetching client ID: ${error.message}`);
    }
};
/**
 * Loads and caches the private key from the file system.
 * @returns {Promise<string>} The private key.
 */
const loadPrivateKey = async () => {
    if (!privateKeyCache) {
        privateKeyCache = await fs.readFile(baseConfig.privateKeyPath, "utf8");
        console.log(privateKeyCache, "Loading private key from file system");
    }
    else {
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
const generateJWT = (privateKey, clientId, userName) => {
    const expiresAt = Date.now() + (180 * 1000);
    const claims = {
        iss: clientId,
        sub: userName,
        aud: "https://login.salesforce.com",
        exp: Math.floor(expiresAt / 1000)
    };
    return {
        token: jwt.sign(claims, privateKey, { algorithm: "RS256" }),
        jwtExpiresAt: expiresAt
    };
};
/**
 * Requests a new access token from Salesforce.
 * @param {string} orgId - The organization ID.
 * @returns {Promise<AuthResult>} The authentication result containing the access token and instance URL.
 */
const requestNewAccessToken = async (orgId, userName) => {
    // console.log(orgId, "orgId from requestNewAccessToken");
    try {
        let clientId = await getClientIdFromSecretManager(orgId);
        // clientId = '3MVG9PwZx9R6_UrcKsn.dhKdoWYbj8AZY5Im_VSx5QB0C32PwXvuJiRaSOetY9cCvvHFEj7tZ2_RtwRcnaGV6'
        console.log(clientId, "Client ID from requestNewAccessToken");
        if (clientId.success === false) {
            return clientId;
        }
        const privateKey = await loadPrivateKey();
        const { token: jwtToken, jwtExpiresAt } = generateJWT(privateKey, clientId, userName);
        console.log(jwtToken, "generated token");
        const params = new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwtToken,
            userName: userName,
        });
        let accessTokenExpiryTime;
        let accessTokenIssuedTime;
        try {
            const response = await axios.post(baseConfig.authUrl, params);
            console.log(response.data, "response data");
            accessTokenCache = response.data.access_token;
            instanceUrlCache = response.data.instance_url;
            console.log(accessTokenCache);
            console.log(instanceUrlCache);
            // const  data:any = await introspectAccessToken(response.data.access_token, clientId, response.data.instance_url);
            // console.log('Test');
            // console.log(data, 'Token Expiry ==> ');
            // accessTokenExpiryTime = data.tokenExpiredTime
            // accessTokenIssuedTime=data.tokenIssuedTime
        }
        catch (error) {
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
            jwtExpiresAt: jwtExpiresAt,
            accessTokenExpiryTime: accessTokenExpiryTime,
            accessTokenIssuedTime: accessTokenIssuedTime
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
    return requestNewAccessToken(orgId, userName);
};
const introspectAccessToken = async (accessToken, client_id, instance_url) => {
    const introspectUrl = `${instance_url}/services/oauth2/introspect`;
    const clientSecret = SF_CLIENT_SECRET;
    console.log(clientSecret, ' Client Secret ');
    const authHeader = `${Buffer.from(`${client_id}:${clientSecret}`).toString('base64')}`;
    console.log(authHeader, 'Auth Header');
    const data = qs.stringify({
        token: accessToken,
        token_type_hint: 'access_token',
    });
    try {
        const response = await axios.post(introspectUrl, data, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const expirationDate = new Date(response.data.exp * 1000);
        const issuedDate = new Date(response.data.iat * 1000);
        console.log(expirationDate, 'Expiration Date');
        const options = {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const expiredDateTime = new Intl.DateTimeFormat('en-IN', options).format(expirationDate);
        const issuedDateTime = new Intl.DateTimeFormat('en-IN', options).format(issuedDate);
        const result = {
            tokenIssuedTime: issuedDateTime,
            tokenExpiredTime: expiredDateTime
        };
        console.log(result, 'Returning Data');
        return result;
    }
    catch (error) {
        console.error('Error during introspection:', error.response ? error.response.data : error.message);
        return { error: error.message };
    }
};
export const sfAuthService = {
    getAccessToken,
};
//# sourceMappingURL=auth.service.js.map