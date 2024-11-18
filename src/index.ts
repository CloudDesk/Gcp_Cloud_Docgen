import { fastify, FastifyRequest, FastifyReply } from "fastify";
import { docGenRouter } from "./router/router.js";
import { PORT } from "./config/config.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { getSecretValue } from "./service/gcp/secretManager.service.js";
import { cleanupCredentials } from "./utils/clearCrendtials.js";
const Fastify = fastify({ logger: false });

async function getApiKey() {
  try {
    return await getSecretValue("docgen_apikey");
  } catch (error) {
    console.error("Error getting API key:", error.message);
    return null;
  }
}

 const API_KEY = await getApiKey();

// console.log(API_KEY, "API_KEY");

function setupSwagger(fastifyInstance) {
  fastifyInstance.register(swagger, {
    openapi: {
      info: {
        title: "Doc Gen Api Documentation",
        description: "API documentation with API key authentication",
        version: "1.0.0",
      },
      servers: [
        {
          //url: "https://docgen-1027746116534.us-central1.run.app",
           url: "http://localhost:4350",
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: "apiKey",
            name: "x-api-key",
            in: "header",
            description: "API key required for protected endpoints.",
          },
        },
      },
      paths: {},
    },
  });

  fastifyInstance.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    transformStaticCSP: (header) => header,
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });
}

function setupCors(fastifyInstance) {
  fastifyInstance.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ["set-cookie"],
  });
}

async function apiKeyValidationHook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const swaggerRoutes = ["/docs", "/docs/*"];
  if (
    swaggerRoutes.some((route) => request.url?.startsWith(route)) ||
    request.url === "/"
  ) {
    return; // Allow requests to Swagger documentation without API key
  }

  const apiKey = request.headers["x-api-key"];
  console.log(apiKey,'apiKey API_KEY');
  console.log(API_KEY,'API');
  if (!apiKey) {
    reply.status(401).send({
      error:
        'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint',
    });
  }

  if (apiKey !== API_KEY) {
    reply.status(403).send({
      error:
        "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
    });
  }
}

// Register the hook
Fastify.addHook("onRequest", apiKeyValidationHook);

setupSwagger(Fastify);
setupCors(Fastify);

Fastify.register(docGenRouter);

const start = async () => {
  try {
    await Fastify.listen({
      port: PORT,
      host: "0.0.0.0",
    });
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    Fastify.log.error("Error starting server:", err);
    process.exit(1);
  }
};

start().catch((err) => {
  Fastify.log.error("Unhandled error starting server:", err);
  process.exit(1);
});

async function initializeApp() {
  await Fastify.ready(); // Ensure Fastify is initialized
  return Fastify;
}

export const app = Fastify;
export { initializeApp };
