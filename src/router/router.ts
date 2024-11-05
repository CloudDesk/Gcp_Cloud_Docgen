import { validateRequestBody } from "../ajv/validation.js"
import { sfvalidationController } from "../controller/sfvalidation.controller.js"
import { validateSalesforceData } from "../schema/validateSalesforceData.js"
import { sfauthController } from "../controller/sfauth.controller.js";
export const DocGenRouter = (fastify, options, done) => {
  fastify.get('/', (request, reply) => {
    console.log('Yeah !!!!');
    reply.send('Successfully Worked')
  })


  fastify.get('/test', (request, reply) => {
    console.log('Yeah !!!!');
    reply.send('Successfully Worked')
  })
  fastify.post('/api/v1/salesforce', { preHandler: [validateRequestBody(validateSalesforceData)] }, sfvalidationController.sfvalidation)

  fastify.post("/v1/gettoken", sfauthController.sfauth);

  done();
};
