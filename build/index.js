import Fastify from "fastify";
import { docGenRouter } from "./router/router.js";
import { PORT } from "./config/config.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { getSecretValue } from "./service/gcp/secretManager.service.js";
const fastify = Fastify({ logger: false });
async function getApiKey() {
    try {
        return await getSecretValue("docgen_apikey");
    }
    catch (error) {
        fastify.log.error("Error fetching API key:", error);
        process.exit(1);
    }
}
const API_KEY = await getApiKey();
console.log(API_KEY, "API_KEY");
fastify.register(swagger, {
    openapi: {
        info: {
            title: "Doc Gen Api Documentation",
            description: "API documentation with API key authentication",
            version: "1.0.0",
        },
        servers: [
            {
                url: "https://docgen-1027746116534.us-central1.run.app",
                // url: "http://localhost:4350",
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
fastify.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    transformStaticCSP: (header) => {
        return header;
    },
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
    },
});
fastify.register(docGenRouter);
fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ["set-cookie"],
});
fastify.addHook("onRequest", (request, reply, done) => {
    const swaggerRoutes = ["/docs", "/docs/*"];
    if (swaggerRoutes.some((route) => request.url?.startsWith(route)) || request.url === "/") {
        return done();
    }
    console.log(request.headers, 'Headers ');
    const apiKey = request.headers["x-api-key"];
    if (!apiKey) {
        return reply.status(401).send({
            error: 'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint',
        });
    }
    if (apiKey !== API_KEY) {
        return reply.status(403).send({
            error: "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
        });
    }
    console.log("API key is valid");
    done();
});
const start = async () => {
    try {
        await fastify.listen({
            port: PORT,
            host: "0.0.0.0",
        });
        console.log(`Server is running on port ${PORT}`);
    }
    catch (err) {
        fastify.log.error("Error starting server:", err);
        process.exit(1);
    }
};
start().catch((err) => {
    fastify.log.error("Unhandled error starting server:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map