import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;

if (!port) {
  console.error('Error: PORT environment variable is not defined.');
  process.exit(1);
}

export const PORTDOCGEN = Number(port);