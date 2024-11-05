import jwt from "jsonwebtoken";
import axios from "axios";

const config = {
  SALESFORCE_AUTH_URL: "https://login.salesforce.com/services/oauth2/token",
  PRIVATE_KEY: process.env.SF_PRIVATE_KEY,
  CLIENT_ID: process.env.SF_CLIENT_ID,
  USERNAME: process.env.SF_USERNAME,
  ORG_ID: process.env.SF_ORG_ID,
};

// In-memory token storage (consider Redis for production)
let accessToken = null;
let tokenExpiry = null;

const generateJWT = () => {
  const claims = {
    iss: config.CLIENT_ID,
    sub: config.USERNAME,
    aud: "https://login.salesforce.com",
    exp: Math.floor(Date.now() / 1000) + 180, // 3 minutes expiry
  };

  return jwt.sign(claims, config.PRIVATE_KEY, { algorithm: "RS256" });
};

const getNewAccessToken = async () => {
  try {
    const assertion = generateJWT();

    const params = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion,
    });

    const response = await axios.post(config.SALESFORCE_AUTH_URL, params);

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;

    return accessToken;
  } catch (error) {
    throw new Error(`Salesforce authentication failed: ${error.message}`);
  }
};

const getValidToken = async () => {
  if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
    await getNewAccessToken();
  }
  console.log(accessToken, "accessToken");
  return accessToken;
};

const clearToken = () => {
  accessToken = null;
  tokenExpiry = null;
};

export const sfauthService = {
  getValidToken,
  clearToken,
  config,
};
