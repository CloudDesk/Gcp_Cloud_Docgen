import { validateRequestBody } from "../ajv/validation.js";
import { documentController } from "../controller/document.controller.js";
import { sfCredentialController } from "../controller/sfcredential.controller.js";
import { sfOrgIdClientIdValidation } from "../schema/validateSalesforceData.js";
import { sfValidateTemplateData } from "../schema/sfuserdatavalidation.js";
import { sfOrgClientIdSwagger } from "../swager/sforgidclientid.swagger.js";
export const docGenRouter = (fastify, options, done) => {
    // Root route
    fastify.get("/", (request, reply) => {
        console.log("Root route accessed");
        reply.send("Successfully Worked DocGen Testing");
    });
    // Salesforce ID validation route
    fastify.post("/api/v1/salesforce/store-credentials", {
        schema: sfOrgClientIdSwagger,
        preHandler: [validateRequestBody(sfOrgIdClientIdValidation)],
    }, sfCredentialController.validateAndStoreSalesforceCredentials);
    fastify.post("/api/v1/salesforce/process-document", {
        preHandler: [validateRequestBody(sfValidateTemplateData)],
    }, documentController.processDocument);
    done();
};
//# sourceMappingURL=router.js.map