export const validateSalesforceData = {
    type: 'object',
    properties: {
        clientId: {
            type: 'string',
            pattern: '^[A-Za-z0-9._-]{85}$',
            errorMessage: {
                type: 'Client ID must be a string.',
                pattern: 'Client ID must be an 85-character alphanumeric string with allowed symbols (.-_)',
            },
        },
        orgId: {
            type: 'string',
            pattern: '^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$',
            errorMessage: {
                type: 'Org ID must be a string.',
                pattern: 'Org ID must start with "00D" and be 15 or 18 alphanumeric characters.',
            },
        },
    },
    required: ['clientId', 'orgId'],
    additionalProperties: false,
    errorMessage: {
        required: {
            clientid: 'Client ID is required.',
            orgId: 'Org ID is required.',
        },
    }
};
//# sourceMappingURL=validateSalesforceData.js.map