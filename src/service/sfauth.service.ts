import jwt from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import { SF_CLIENT_ID,SF_ORG_ID ,SF_USERNAME} from "../config/config.js";


let SF_PRIVATE_KEY : string;
try {
  SF_PRIVATE_KEY = fs.readFileSync("privateKey.pem", "utf8");
} catch (error) {
  console.error("Error loading private key:", error.message);
  throw new Error("Private key not found. Please ensure privateKey.pem exists in the correct path.");
}
const config = {
  SALESFORCE_AUTH_URL: "https://login.salesforce.com/services/oauth2/token",
  PRIVATE_KEY: SF_PRIVATE_KEY,
  CLIENT_ID: SF_CLIENT_ID,
  USERNAME: SF_USERNAME,
  ORG_ID: SF_ORG_ID,
};
let accessToken = null;

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
    return { accessToken };
  } catch (error) {
    //throw new Error(`Salesforce authentication failed: ${error.message}`);
    return { error: `Salesforce authentication failed: ${error.message}` };
  }
};

const getValidToken = async () => {
  if (!accessToken) {
    await getNewAccessToken();
  }
  return { accessToken };
};

const clearToken = () => {
  accessToken = null;
};

export const sfauthService = {
  getValidToken,
  clearToken,
  config,
};
