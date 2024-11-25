export const errorResponse = (description: string, example: string) => ({
  description,
  type: "object",
  properties: {
    error: {
      type: "string",
      example,
    },
  },
});
