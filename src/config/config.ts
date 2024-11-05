import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;
export const SF_ORG_ID = process.env.SF_ORG_ID;
export const SF_USERNAME = process.env.SF_USERNAME;
export const SF_CLIENT_ID = process.env.SF_CLIENT_ID;

if (!port) {
  console.error("Error: PORT environment variable is not defined.");
  process.exit(1);
}

export const PORTDOCGEN = Number(port);
