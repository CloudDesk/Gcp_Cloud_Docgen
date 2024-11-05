import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;
export const API_KEY = process.env.API_KEY;

if (!port) {
  console.error('Error: PORT environment variable is not defined.');
  process.exit(1);
}

export const PORT = Number(port);

