import Fastify from 'fastify';
import { DocGenRouter } from './router/router.js';
import { API_KEY, PORT } from './config/config.js';
import cors from "@fastify/cors";
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const fastify: any = Fastify({ logger: false });

fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Doc Gen Api Documentation',
            description: 'API documentation with API key authentication',
            version: '1.0.0'
        },
        servers: [
            {
                url: 'http://localhost:4350',
                //url: 'https://docgen-1027746116534.us-central1.run.app',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    name: 'x-api-key',
                    in: 'header',
                    description: 'API key required for protected endpoints.'
                }
            }
        },
        paths: {}
    }
});

fastify.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    transformStaticCSP: (header) => {
        console.log(JSON.stringify(header), 'header is ');
        return header
    },
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
    },
});
fastify.register(DocGenRouter);

fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ["set-cookie"],
});


fastify.addHook('onRequest', (request, reply, done) => {
    console.log(request.url);
    if (request.url === '/') {
        return done();
    }
    const swaggerRoutes = ['/docs', '/docs/*'];
    if (swaggerRoutes.some(route => request.url?.startsWith(route))) {
        return done();
    }
    console.log(request.headers);
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
        const error: any = new Error('API key is missing');
        error.statusCode = 401;
        console.error(error)
        return done('API key is missing');
    }

    if (apiKey !== API_KEY) {
        const error: any = new Error('Invalid API key provided. Please ensure you are using the correct API key.');
        error.statusCode = 403;
        console.error(error)
        return done('Invalid API key provided. Please ensure you are using the correct API key.');
    }
    else {
        console.log('API key is valid');
        done();

    }

});

// fastify.setErrorHandler((error, request, reply) => {
//     fastify.log.error(error);

//     const response = {
//         statusCode: error.statusCode || 500,
//         error: error.name || 'Internal Server Error',
//         message: error.message || 'An unexpected error occurred',
//     };

//     reply.status(response.statusCode).send(response);
// });

const start = async () => {
    try {
        await fastify.listen({
            port: PORT,
            host: "0.0.0.0",
            listen: true,
        });
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        fastify.log.error("Error starting server:", err);
        process.exit(1);
    }
};

start().catch((err) => {
    fastify.log.error("Unhandled error starting server:", err);
    process.exit(1);
});
