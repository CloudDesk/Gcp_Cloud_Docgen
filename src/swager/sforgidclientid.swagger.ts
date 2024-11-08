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
          example:
            "Salesforce client and organization IDs are validated successfully.",
        },
      },
    },
    400: {
      description: "Required Body is missing Or Validation Failed",
      type: "object",
      properties: {
        error: {
          type: "string",
          example:
            'Client ID must be an 85-character alphanumeric string with allowed symbols (.-_) and Org ID must start with "00D" and be 15 or 18 alphanumeric characters.',
        },
      },
    },
    401: {
      description: "Unauthorized - API key missing or invalid",
      type: "object",
      properties: {
        error: {
          type: "string",
          example:
            'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint',
        },
      },
    },
    403: {
      description: "Forbidden - Invalid API key",
      type: "object",
      properties: {
        error: {
          type: "string",
          example:
            "Access denied. The provided API key is incorrect. Ensure you are using the correct API key to access this route.",
        },
      },
    },
  },
};
