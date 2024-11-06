import { validateRequestBody } from "../ajv/validation.js";
import { sfvalidationController } from "../controller/sfvalidation.controller.js";
import { sforgidclientidvalidation } from "../schema/validateSalesforceData.js";
import { sfauthController } from "../controller/sfauth.controller.js";
import { sforgclientidswagger } from "../swager/sforgidclientid.swagger.js";
import { sfvalidateuserdata } from "../schema/sfuserdatavalidation.js";
import { processDocumentController } from "../controller/document.controller.js";
import { processDocumentswagger } from "../swager/processdocument.swager.js";

export const DocGenRouter = (fastify, options, done) => {
  fastify.get("/", (request, reply) => {
    console.log("Yeah !!!!");
    reply.send("Successfully Worked");
  });

  fastify.post(
    "/api/v1/salesforce/ids",
    {
      schema: sforgclientidswagger,
      preHandler: [validateRequestBody(sforgidclientidvalidation)],
    },
    sfvalidationController.sfvalidation
  );

  fastify.post(
    "/api/v1/salesforce/process-document",
    {
      schema: processDocumentswagger,
      preHandler: [validateRequestBody(sfvalidateuserdata)],
    },
    processDocumentController.processDocument
  );

  fastify.post("/v1/gettoken", sfauthController.sfauth);

  done();
};
