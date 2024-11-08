export const sfValidateTemplateData = {
    type: "object",
    properties: {
        orgID: {
            type: "string",
            pattern: "^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$",
            errorMessage: {
                type: "Org ID must be a string.",
                pattern: 'Org ID must start with "00D" and be 15 or 18 alphanumeric characters.',
            },
        },
        userName: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "User Name must be a string.",
                minLength: "User Name cannot be empty.",
            },
        },
        recordID: {
            type: "string",
            pattern: "^[A-Za-z0-9]{15,18}$",
            errorMessage: {
                type: "Record ID must be a string.",
                pattern: "Record ID must be 15 or 18 alphanumeric characters.",
            },
        },
        fileName: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "File Name must be a string.",
                minLength: "File Name cannot be empty.",
            },
        },
        templateURL: {
            type: "string",
            // format: "uri",
            errorMessage: {
                type: "Template URL must be a string.",
                format: "Template URL must be a valid URL.",
            },
        },
        fieldData: {
            type: "object",
            errorMessage: {
                type: "Field Data must be an object.",
            },
        },
    },
    required: ["orgID", "userName", "recordID", "fileName", "templateURL"],
    additionalProperties: false,
    errorMessage: {
        required: {
            orgID: "Org ID is required.",
            userName: "User Name is required.",
            recordID: "Record ID is required.",
            fileName: "File Name is required.",
            templateURL: "Template URL is required.",
        },
    },
};
//# sourceMappingURL=sfuserdatavalidation.js.map