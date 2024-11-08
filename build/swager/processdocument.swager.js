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
            fieldData: { type: "array" },
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
                    example: "Salesforce client and organization IDs are validated successfully.",
                },
            },
        },
        400: errorResponse("Required Body is missing Or Validation Failed", 'Client ID must be an 85-character alphanumeric string with allowed symbols (.-_) and Org ID must start with "00D" and be 15 or 18 alphanumeric characters.'),
        401: errorResponse("Unauthorized - API key missing or invalid", 'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.'),
        403: errorResponse("Forbidden - Invalid API key", "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route."),
    },
};
//# sourceMappingURL=processdocument.swager.js.map