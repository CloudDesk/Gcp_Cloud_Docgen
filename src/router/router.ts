import { validateRequestBody } from "../ajv/validation.js"
import { sfvalidationController } from "../controller/sfvalidation.controller.js"
import { validateSalesforceData } from "../schema/validateSalesforceData.js"
import { sfauthController } from "../controller/sfauth.controller.js";
import { sforgclientidschema } from "../swager/sforgidclientid.js";
export const DocGenRouter = (fastify, options, done) => {
  fastify.get('/', (request, reply) => {
    console.log('Yeah !!!!');
    reply.send('Successfully Worked')
  })
console.log('router');

  // fastify.post('/api/v1/salesforce', { preHandler: [validateRequestBody(validateSalesforceData)] }, sfvalidationController.sfvalidation)

  fastify.post('/api/v1/salesforce',
     {
     schema: sforgclientidschema,
    preHandler: [validateRequestBody(validateSalesforceData)]
  }, 
  sfvalidationController.sfvalidation);

  fastify.post("/v1/gettoken", sfauthController.sfauth);

  done();
};
