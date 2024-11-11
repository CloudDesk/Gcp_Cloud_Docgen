import { errorResponse } from "./helperMethods/swagger.errorHandler.js";
export const processDocumentSwagger = {
    description: "Salesforce Document processing route that requires an API key",
    tags: ["Salesforce Document processing"],
    security: [{ ApiKeyAuth: [] }],
    body: {
        type: "object",
        properties: {
            orgId: { type: "string" },
            userName: { type: "string" },
            recordId: { type: "string" },
            fileName: { type: "string" },
            contentVersionId: { type: "string" },
            fieldData: {
                type: "array",
                items: { type: "object" },
            },
        },
        required: [
            "orgId",
            "userName",
            "recordId",
            "fileName",
            "contentVersionId",
            "fieldData",
        ],
    },
    response: {
        200: {
            description: "Validation successful",
            type: "object",
            properties: {
                message: {
                    type: "string",
                    example: "Document processing successful. Document has been created in Salesforce.",
                },
            },
        },
        400: errorResponse("Required Body is missing Or Validation Failed", 'Error Happend'),
        401: errorResponse("Unauthorized - API key missing or invalid", 'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.'),
        403: errorResponse("Forbidden - Invalid API key", "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route."),
    },
};
//# sourceMappingURL=processdocument.swager.js.map