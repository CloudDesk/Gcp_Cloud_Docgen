// import { errorResponse } from "./helperMethods/swagger.errorHandler.js";
// export const processDocumentSwagger = {
//   description: "Salesforce Document Proccessor requires an API key",
//   tags: ["Salesforce Document Processor"],
//   security: [{ ApiKeyAuth: [] }],
//   body: {
//     type: "object",
//     properties: {
//       orgId: { type: "string" },
//       recordId: { type: "string" },
//       fileName: { type: "string" },
//       contentVersionId: { type: "string" },
//       fieldData: {
//         type: 'array',
//         items: { type: 'object' },
//       },
//     },
//     required: ["orgId", "recordId", "fileName", "contentVersionId", "fieldData"],
//   },
//   response: {
//     200: {
//       description: "Validation successful",
//       type: "object",
//       properties: {
//         message: {
//           type: "string",
//           example:
//             "Document Uploaded Successfully.",
//         },
//       },
//     },
//     400: errorResponse(
//       "Authentication Failed",
//       'Authentication Failed. Please provide a valid Id.'
//     ),
//     401: errorResponse(
//       "Unauthorized - API key missing or invalid",
//       'API key is missing or invalid. Please include a valid API key in the "x-api-key" header to access this endpoint'
//     ),
//     403: errorResponse(
//       "Validation Failed",
//       "Required Field Missing or Validation Failed"
//     ),
//   },
// };
//# sourceMappingURL=processdocument.swager.js.map