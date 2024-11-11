// Define reusable error message generators
const generateErrorMessage = (name, options) => ({
    type: `${name} must be a string.`,
    ...(options.pattern && { pattern: `${name} must be ${options.pattern}.` }),
    ...(options.minLength && { minLength: `${name} cannot be empty.` }),
    ...(options.format && { format: `${name} must be a valid ${options.format}.` }),
    ...(options.array && { type: `${name} must be an array.` }),
});
const requiredErrorMessage = (fields) => Object.fromEntries(fields.map((field) => [field, `${field} is required.`]));
// Schema definition with dynamic defaults
export const sfValidateTemplateData = {
    type: "object",
    properties: {
        orgId: {
            type: "string",
            pattern: "^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$",
            errorMessage: generateErrorMessage("Org ID", {
                pattern: 'start with "00D" and be 15 or 18 alphanumeric characters',
            }),
        },
        userName: {
            type: "string",
            minLength: 1,
            errorMessage: generateErrorMessage("User Name", { minLength: true }),
        },
        recordId: {
            type: "string",
            pattern: "^[A-Za-z0-9]{15,18}$",
            errorMessage: generateErrorMessage("Record ID", {
                pattern: "15 or 18 alphanumeric characters",
            }),
        },
        fileName: {
            type: "string",
            minLength: 1,
            errorMessage: generateErrorMessage("File Name", { minLength: true }),
        },
        contentVersionId: {
            type: "string",
            errorMessage: generateErrorMessage("Template URL", { format: "URL" }),
        },
        fieldData: {
            type: "array",
            errorMessage: generateErrorMessage("Field Data", { array: true }),
        },
    },
    required: ["orgId", "userName", "recordId", "fileName", "contentVersionId", "fieldData"],
    additionalProperties: false,
    errorMessage: {
        required: requiredErrorMessage([
            "orgId",
            "userName",
            "recordId",
            "fileName",
            "contentVersionId",
            "fieldData",
        ]),
    },
};
//# sourceMappingURL=sfuserdatavalidation.js.map