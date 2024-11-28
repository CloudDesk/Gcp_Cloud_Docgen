import { errorResponse } from "./helperMethods/swagger.errorHandler.js";
export const sfOrgClientIdSwagger = {
    description: "Salesforce validation route that requires an API key",
    tags: ["Salesforce Org id and Client id validation"],
    security: [{ ApiKeyAuth: [] }],
    body: {
        type: "object",
        properties: {
            clientId: { type: "string" },
            orgId: { type: "string" },
        },
        required: ["clientId", "orgId"],
    },
    response: {
        200: {
            description: "Validation successful",
            type: "object",
            properties: {
                message: {
                    type: "string",
                    example: "Salesforce client and organization IDs are validated successfully.",
                },
            },
        },
        400: errorResponse("Authentication Failed", 'Authentication Failed. Please provide a valid Id.'),
        401: errorResponse("Unauthorized - API key missing or invalid", 'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint'),
        403: errorResponse("Validation Failed", "Required Field Missing or Validation Failed"),
    },
};
//# sourceMappingURL=sforgidclientid.swagger.js.map