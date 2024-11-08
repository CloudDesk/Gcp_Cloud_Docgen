export const errorResponse = (description, example) => ({
    description,
    type: "object",
    properties: {
        error: {
            type: "string",
            example,
        },
    },
});
//# sourceMappingURL=swagger.errorHandler.js.map