import { ARRAY, OBJECT, STRING } from "../utils/datatype/datatype.utils.js";
import { errorResponse } from "./helperMethods/swagger.errorHandler.js";
const createErrorResponse = (description, message) => errorResponse(description, message);
export const processDocumentSwagger = {
    description: "Salesforce Document processing route that requires an API key",
    tags: ["Salesforce Document processing"],
    security: [{ ApiKeyAuth: [] }],
    body: {
        type: OBJECT,
        properties: {
            orgId: { type: STRING },
            userName: { type: STRING },
            recordId: { type: STRING },
            fileName: { type: STRING },
            contentVersionId: { type: STRING },
            fieldData: {
                type: ARRAY,
                items: { type: OBJECT },
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
            type: OBJECT,
            properties: {
                message: {
                    type: STRING,
                    example: "Document processing successful. Document has been created in Salesforce.",
                },
            },
        },
        400: createErrorResponse("Required Body is missing Or Validation Failed", "Error Happend"),
        401: createErrorResponse("Unauthorized - API key missing or invalid", 'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.'),
        403: createErrorResponse("Forbidden - Invalid API key", "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route."),
    },
};
//# sourceMappingURL=processdocument.swager.js.map