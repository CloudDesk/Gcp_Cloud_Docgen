import { storeSecret } from "../gcp/secretManager.service.js";
// Service for handling Salesforce credentials
export const sfCredentialService = {
    /**
     * Validates and stores Salesforce credentials.
     * @param payload - The payload containing clientId and orgId.
     * @returns A promise resolving to an object indicating success or error.
     */
    async validateAndStoreCredentials(payload) {
        console.log("Payload received:", payload);
        // Validate the payload
        if (!payload.clientId || !payload.orgId) {
            return { error: "Client ID and Org ID are required" };
        }
        try {
            // Store the client ID and org ID using the secret manager service
            const storeResult = await storeSecret(payload.clientId, payload.orgId);
            console.log("Store client id result:", storeResult);
            return { success: storeResult };
        }
        catch (error) {
            console.error("Error storing client ID:", error);
            return { error: "Failed to store client ID" };
        }
    },
};
//# sourceMappingURL=sfcredential.service.js.map