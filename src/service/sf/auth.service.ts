import jwt from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import { SF_CLIENT_ID, SF_ORG_ID, SF_USERNAME } from "../../config/config.js";

const PRIVATE_KEY_PATH = "privateKey.pem";
const SALESFORCE_AUTH_URL = "https://login.salesforce.com/services/oauth2/token";

let SF_PRIVATE_KEY: string;
try {
    SF_PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
} catch (error) {
    console.error("Error loading private key:", error.message);
    throw new Error(
        "Private key not found. Please ensure privateKey.pem exists in the correct path."
    );
}

const config = {
    SALESFORCE_AUTH_URL,
    PRIVATE_KEY: SF_PRIVATE_KEY,
    CLIENT_ID: SF_CLIENT_ID,
    USERNAME: SF_USERNAME,
    ORG_ID: SF_ORG_ID,
};

let accessToken: string | null = null;
let instanceUrl: string | null = null;

const generateJWT = (): string => {
    const claims = {
        iss: config.CLIENT_ID,
        sub: config.USERNAME,
        aud: "https://login.salesforce.com",
        exp: Math.floor(Date.now() / 1000) + 180, // 3 minutes expiry
    };

    return jwt.sign(claims, config.PRIVATE_KEY, { algorithm: "RS256" });
};

const getNewAccessToken = async (): Promise<{ accessToken: string | null; instanceUrl: string | null; error?: string }> => {
    try {
        const assertion = generateJWT();
        const params = new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        });

        const response = await axios.post(config.SALESFORCE_AUTH_URL, params);
        accessToken = response.data.access_token;
        instanceUrl = response.data.instance_url;
        return { accessToken, instanceUrl };
    } catch (error) {
        return { accessToken: null, instanceUrl: null, error: `Salesforce authentication failed: ${error.message}` };
    }
};

const getValidToken = async (): Promise<{ accessToken: string | null; instanceUrl: string | null; error?: string }> => {
    if (!accessToken) {
        return await getNewAccessToken();
    }
    return { accessToken, instanceUrl };
};

const clearToken = (): void => {
    accessToken = null;
    instanceUrl = null;
};

export const sfauthService = {
    getValidToken,
    clearToken,
    config,
};
