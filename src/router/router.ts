import { sfvalidationController } from "../controller/sfvalidation.controller.js"

export const DocGenRouter = (fastify, options, done) => {
    fastify.get('/', (request, reply) => {
        reply.send('Worked')
    })

    fastify.post('/v1/salesforce',sfvalidationController.sfvalidation)
    done()
}