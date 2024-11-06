export const sfvalidationService = {
    async sfvalidationService(Payload) {
        try {
            if (Payload.clientId && Payload.orgId) {
                return { message: 'Success' };
            }
            else {
                return { error: 'Failed' };
            }
        }
        catch (error) {
            console.log(error);
            return { error: 'Failed to get access token' };
        }
    }
};
//# sourceMappingURL=sfvalidation.service.js.map