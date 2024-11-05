import { validateRequestBody } from "../ajv/validation.js"
import { sfvalidationController } from "../controller/sfvalidation.controller.js"
import { validateSalesforceData } from "../schema/validateSalesforceData.js"

export const DocGenRouter = (fastify, options, done) => {
  fastify.get('/', (request, reply) => {
    console.log('TESRT');
    reply.send('Worked')
  })
  fastify.post('/api/v1/salesforce', { preHandler: [validateRequestBody(validateSalesforceData)] }, sfvalidationController.sfvalidation)
  done()
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   