import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;
export const API_KEY = process.env.API_KEY;
export const SF_ORG_ID = process.env.SF_ORG_ID;
export const SF_USERNAME = process.env.SF_USERNAME;
export const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
export const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT;
export const SF_ORG_ID_TWO = process.env.SF_ORG_ID_TWO;
export const BASE_URL =process.env.BASE_URL
export const DOCGEN_API_KEY =process.env.DOCGEN_API_KEY
export const SERVICE_ACCOUNT_TYPE = process.env.SERVICE_ACCOUNT_TYPE;
export const SERVICE_ACCOUNT_PROJECT_ID = process.env.SERVICE_ACCOUNT_PROJECT_ID;
export const SERVICE_ACCOUNT_PRIVATE_KEY_ID = process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID;
export const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
export const SERVICE_ACCOUNT_CLIENT_EMAIL = process.env.SERVICE_ACCOUNT_CLIENT_EMAIL;
export const SERVICE_ACCOUNT_CLIENT_ID = process.env.SERVICE_ACCOUNT_CLIENT_ID;
export const SERVICE_ACCOUNT_AUTH_URI = process.env.SERVICE_ACCOUNT_AUTH_URI;
export const SERVICE_ACCOUNT_TOKEN_URI = process.env.SERVICE_ACCOUNT_TOKEN_URI;
export const SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL = process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL;
export const SERVICE_ACCOUNT_CLIENT_X509_CERT_URL = process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL;
export const SERVICE_ACCOUNT_UNIVERSE_DOMAIN = process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN;

export const PORT = Number(port);

