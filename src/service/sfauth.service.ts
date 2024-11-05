import jwt from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import { SF_CLIENT_ID, SF_ORG_ID, SF_USERNAME } from "../config/config";

// const SF_PRIVATE_KEY =
//   "FF475B4D775DDD62BABB722D4A6C61E4856F860846B6133C5A7064B01AC8537E";
const SF_PRIVATE_KEY = fs.readFileSync("privateKey.pem", "utf8");
// const SF_ORG_ID = "00DWU00000BoiXu";
// const SF_USERNAME = "cddev@org.com";
// const SF_CLIENT_ID =
//   "3MVG9PwZx9R6_UrcKsn.dhKdoWYbj8AZY5Im_VSx5QB0C32PwXvuJiRaSOetY9cCvvHFEj7tZ2_RtwRcnaGV6";

const config = {
  SALESFORCE_AUTH_URL: "https://login.salesforce.com/services/oauth2/token",
  PRIVATE_KEY: SF_PRIVATE_KEY,
  CLIENT_ID: SF_CLIENT_ID,
  USERNAME: SF_USERNAME,
  ORG_ID: SF_ORG_ID,
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
    console.log(response.data, "response.data is ");
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    console.log(tokenExpiry, "tokenExpiry is ");
    return { accessToken };
  } catch (error) {
    throw new Error(`Salesforce authentication failed: ${error.message}`);
  }
};

const getValidToken = async () => {
  if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
    await getNewAccessToken();
  }
  return { accessToken };
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
