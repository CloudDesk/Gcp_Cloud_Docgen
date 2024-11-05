import fastify from 'fastify';
import { DocGenRouter } from './router/router.js';
import { PORTDOCGEN } from './config/config.js';

const Fastify = fastify({ logger: false })
Fastify.register(DocGenRouter)
console.log(PORTDOCGEN);
Fastify.listen({ port: PORTDOCGEN }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

PORTDOCGEN