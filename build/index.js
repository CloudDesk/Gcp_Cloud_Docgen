import fastify from 'fastify';
import { DocGenRouter } from './router/router.js';
import { PORTDOCGEN } from './config/config.js';
import cors from "@fastify/cors";
const Fastify = fastify({ logger: false });
Fastify.register(DocGenRouter);
console.log(PORTDOCGEN);
await Fastify.register(cors, {
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 86400, // 24 hours
    exposedHeaders: ["set-cookie"],
});
const API_KEY = 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY';
Fastify.addHook('onRequest', (request, reply, done) => {
    const apiKey = request.headers['x-api-key'];
    if (apiKey !== API_KEY) {
        // Log unauthorized access
        console.error(`Unauthorized access attempt on ${new Date().toISOString()} from IP: ${request.ip}`);
        reply.code(403).send({ error: 'Forbidden' });
    }
    else {
        done();
    }
});
Fastify.setErrorHandler((error, request, reply) => {
    reply.code(error.statusCode || 500).send({ error: error.message });
});
// Add 404 handler
Fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: `Route ${request.url} not found` });
});
const start = async () => {
    try {
        await Fastify.listen({
            port: PORTDOCGEN,
            host: "0.0.0.0",
            listen: true,
        });
        console.log(`Server is running on ${Fastify.server.address().port}`);
    }
    catch (err) {
        return err;
    }
};
start().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map