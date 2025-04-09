import { fastify, FastifyRequest, FastifyReply } from "fastify";
import { docGenRouter } from "./router/router.js";
import { BASE_URL, DOCGEN_API_KEY, PORT } from "./config/config.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
const Fastify = fastify({ logger: false});
import Multer from "fastify-multer";
import multipart from '@fastify/multipart';

import fastifyStatic from "@fastify/static";
import formbody from "@fastify/formbody";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import path from "path";
// import { salesforceTemplate } from "./utils/datatype/template.util.js";

console.log(DOCGEN_API_KEY, "API key from secret manager DOCGEN_API_KEY");


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "..");


function setupSwagger(fastifyInstance) {
    console.log('inside setupSwagger')
    const SWAGGER_URL = BASE_URL;

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
        origin: "*", 
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allowedHeaders: "*", 
        credentials: true, 
        maxAge: 86400, 
        exposedHeaders: "*",

    });
}

async function apiKeyValidationHook(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const swaggerRoutes = ["/docs", "/docs/*", '/wopi/*','/wopi','/save-document','/save-document/*'];
        if (
            swaggerRoutes.some((route) => request.url?.startsWith(route)) ||
            request.url === "/"
        ) {
            return; // Allow requests to Swagger documentation without API key
        }
        console.log('inside hhook')
        console.log(request.headers, 'request.headers');
        const headerApiKey = request.headers["x-api-key"];
        console.log(headerApiKey, "headerApiKey");
        console.log(request.body, 'global hook check')
        if (!headerApiKey) {
            return reply.status(401).send({
                error:
                    'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.',
            });
        }

        if (headerApiKey !== DOCGEN_API_KEY) {
            return reply.status(403).send({
                error:
                    "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
            });
        }
    } catch (error) {
        console.log(error, `error in global hook`);
    }

}
console.log('test');
Fastify.addHook("onRequest", apiKeyValidationHook);



setupSwagger(Fastify);
setupCors(Fastify);
// salesforceTemplate();
Fastify.register(formbody);
// fastify.register(fastifyCookie)
// Fastify.register(Multer.contentParser);
Fastify.register(multipart);

Fastify.register(docGenRouter);

console.log(join(parentDir, "./src/uploads"), "INDEX PATH");
console.log(parentDir, "INDEX PATH 2");

Fastify.register(fastifyStatic, {
    root: join(parentDir, "./src/uploads"),
});

const start = async () => {
    try {
        await Fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        console.error("Error starting server:", err.message);

    }
};

start()

async function initializeApp() {
    await Fastify.ready();   // Ensure Fastify is initialized
    return Fastify;
}

export const app = Fastify;
export { initializeApp, DOCGEN_API_KEY };
