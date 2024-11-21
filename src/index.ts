import { fastify, FastifyRequest, FastifyReply } from "fastify";
import { docGenRouter } from "./router/router.js";
import { BASE_URL, PORT } from "./config/config.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { getSecretValue } from "./service/gcp/secretManager.service.js";
const Fastify = fastify({ logger: { level: 'debug' } });
let apiKeyFromSecretManager = null;
console.log(apiKeyFromSecretManager, "API key from secret manager");
console.log('done')
async function initializeApiKey() {
    try {
        if (!apiKeyFromSecretManager) {
          apiKeyFromSecretManager = await getSecretValue("docgen_apikey");
            console.log("API Key initialized:", apiKeyFromSecretManager);
        }
        if(apiKeyFromSecretManager.error) {
            throw new Error("API key initialization failed"); 
        }
        return apiKeyFromSecretManager;
    } catch (error) {
        console.error("Error getting API key:", error.message);
        throw new Error("API key initialization failed"); 
    }
}

function setupSwagger(fastifyInstance) {
    const SWAGGER_URL =BASE_URL || "http://localhost:4350";

    fastifyInstance.register(swagger, {
        openapi: {
            info: {
                title: "Doc Gen Api Documentation",
                description: "API documentation with API key authentication",
                version: "1.0.0",
            },
            servers: [{ url: SWAGGER_URL }],
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
        origin: true, // Adjust for production
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
    if (!apiKey) {
        return reply.status(401).send({
            error:
                'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.',
        });
    }

    if (apiKey !== apiKeyFromSecretManager) {
        return reply.status(403).send({
            error:
                "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
        });
    }
}

Fastify.addHook("onRequest", apiKeyValidationHook);

setupSwagger(Fastify);
setupCors(Fastify);

Fastify.register(docGenRouter);

const start = async () => {
    try {
        await initializeApiKey();
        await Fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        console.error("Error starting server:", err.message);

    }
};

start().catch((err) => {
    console.error("Unhandled error starting server:", err);
    process.exit(1);
});

async function initializeApp() {
  await initializeApiKey(); // Ensure the API key is set
  await Fastify.ready();   // Ensure Fastify is initialized
  return Fastify;
}

export const app = Fastify;
export { initializeApp, initializeApiKey, apiKeyFromSecretManager };
