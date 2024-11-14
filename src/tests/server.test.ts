import { FastifyInstance } from "fastify";
import { getSecretValue } from "../../src/service/gcp/secretManager.service";
import { Fastify } from "../index";
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY;
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_ORG_ID = process.env.SF_ORG_ID;
console.log(API_KEY  ,'process env api key');
console.log(SF_CLIENT_ID ,'process env client id');
console.log(SF_ORG_ID ,'process env org id');



// Mock the secret value fetching function to avoid external dependency
jest.mock("./../service/gcp/secretManager.service", () => ({
  getSecretValue: jest.fn(),
}));

describe("Fastify Server", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Set up the server instance and start it
    app = Fastify;
    (getSecretValue as jest.Mock).mockResolvedValue(API_KEY);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("API Key Validation", () => {
    it("should allow requests with the correct API key", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test",
        headers: { "x-api-key": API_KEY },
      });

      expect(response.statusCode).not.toBe(403);
      expect(response.statusCode).not.toBe(401);
    });

    it("should return 401 if the API key is missing", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test", // Change to a real endpoint
      });

      expect(response.statusCode).toBe(401);
    });

//     it("should return 403 if the API key is incorrect", async () => {
//       const response = await app.inject({
//         method: "GET",
//         url: "/api/some-protected-endpoint", // Change to a real endpoint
//         headers: { "x-api-key": "invalid_key" },
//       });

//       expect(response.statusCode).toBe(403);
//       expect(response.json().error).toContain("Access denied. The provided API key is incorrect.");
//     });
//   });

//   describe("Swagger Documentation", () => {
//     it("should serve Swagger UI at /docs without API key", async () => {
//       const response = await app.inject({
//         method: "GET",
//         url: "/docs",
//       });

//       expect(response.statusCode).toBe(200);
//       expect(response.headers["content-type"]).toContain("text/html");
//     });
//   });

//   describe("CORS Setup", () => {
//     it("should allow cross-origin requests", async () => {
//       const response = await app.inject({
//         method: "OPTIONS",
//         url: "/", // Adjust path as needed
//         headers: {
//           origin: "http://localhost:3000",
//           "access-control-request-method": "POST",
//         },
//       });

//       expect(response.statusCode).toBe(204);
//       expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
//       expect(response.headers["access-control-allow-methods"]).toContain("POST");
//     });
  });
});
