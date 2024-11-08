import { validateRequestBody } from "../ajv/validation.js";
import { documentController } from "../controller/document.controller.js";
import { sfCredentialController } from "../controller/sfcredential.controller.js";
import { sfOrgIdClientIdValidation } from "../schema/validateSalesforceData.js";
import { sfValidateTemplateData } from "../schema/sfuserdatavalidation.js";
import { sfOrgClientIdSwagger } from "../swager/sforgidclientid.swagger.js";
import { processDocumentSwagger } from "../swager/processdocument.swager.js";

export const docGenRouter = (fastify, options, done) => {
  // Root route
  fastify.get("/", (request, reply) => {
    console.log("Root route accessed");
    reply.send("Successfully Worked");
  });

  // Salesforce ID validation route
  fastify.post(
    "/api/v1/salesforce/ids",
    {
      schema: sfOrgClientIdSwagger,
      preHandler: [validateRequestBody(sfOrgIdClientIdValidation)],
    },
    sfCredentialController.validateSalesforceCredentials
  );

  // Salesforce process document route
  fastify.post(
    "/api/v1/salesforce/process-document",
    {
      schema: processDocumentSwagger,
      preHandler: [validateRequestBody(sfValidateTemplateData)],
    },
    documentController.processDocument
  );

  done();
};
