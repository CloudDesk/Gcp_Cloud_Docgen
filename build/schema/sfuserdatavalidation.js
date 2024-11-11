import { ARRAY, OBJECT, STRING } from "../utils/datatype/datatype.utils.js";
const generateErrorMessage = (name, options) => {
    const messages = {
        type: `${name} must be a string.`,
        ...(options.pattern && { pattern: `${name} must be ${options.pattern}.` }),
        ...(options.minLength && { minLength: `${name} cannot be empty.` }),
        ...(options.format && { format: `${name} must be a valid ${options.format}.` }),
        ...(options.array && { type: `${name} must be an array.` }),
    };
    return messages;
};
const requiredErrorMessage = (fields) => Object.fromEntries(fields.map((field) => [field, `${field} is required.`]));
const createField = (name, type, options = {}) => ({
    type,
    ...options,
    errorMessage: generateErrorMessage(name, options),
});
const requiredFields = [
    "orgId",
    "userName",
    "recordId",
    "fileName",
    "contentVersionId",
    "fieldData",
];
// Schema definition with dynamic defaults
export const sfValidateTemplateData = {
    type: OBJECT,
    properties: {
        orgId: createField("Org ID", STRING, {
            pattern: "^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$",
        }),
        userName: createField("User Name", STRING, {
            minLength: 1,
        }),
        recordId: createField("Record ID", STRING, {
            pattern: "^[A-Za-z0-9]{15,18}$",
        }),
        fileName: createField("File Name", STRING, {
            minLength: 1,
        }),
        contentVersionId: createField("Template URL", STRING, {
            format: "URL",
        }),
        fieldData: createField("Field Data", ARRAY),
    },
    required: requiredFields,
    additionalProperties: false,
    errorMessage: {
        required: requiredErrorMessage(requiredFields),
    },
};
//# sourceMappingURL=sfuserdatavalidation.js.map