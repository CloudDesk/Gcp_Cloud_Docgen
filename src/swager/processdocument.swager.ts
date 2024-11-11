import { errorResponse } from "./helperMethods/swagger.errorHandler.js";

// Define reusable error response messages
const errorMessages = {
  400: {
    title: "Required Body is missing Or Validation Failed",
    detail: "Error Happend",
  },
  401: {
    title: "Unauthorized - API key missing or invalid",
    detail:
      'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint.',
  },
  403: {
    title: "Forbidden - Invalid API key",
    detail:
      "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
  },
};

// Helper to generate responses dynamically
type ErrorMessages = {
  [key: string]: {
    title: string;
    detail: string;
  };
};

const generateErrorResponses = (messages: ErrorMessages) =>
  Object.fromEntries(
    Object.entries(messages).map(([status, { title, detail }]) => [
      status,
      errorResponse(title, detail),
    ])
  );

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
          example:
            "Document processing successful. Document has been created in Salesforce.",
        },
      },
    },
    ...generateErrorResponses(errorMessages),
  },
};
