import { sfCredentialService } from "../service/sf/sfcredential.service.js";
import { FastifyReply, FastifyRequest } from "fastify";

// Define the structure of the validation payload
interface ValidationPayload {
  clientId: string;
  orgId: string;
}

// Controller for Salesforce credential operations
export const sfCredentialController = {
  /**
   * Validates Salesforce credentials and stores the client ID in Secret Manager.
   * @param request - Fastify request object
   * @param reply - Fastify reply object
   */
  async validateSalesforceCredentials(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Extract and log the payload from the request body
      const payload: ValidationPayload = request.body as ValidationPayload;
      console.log("Payload received:", payload);

      // Validate the Salesforce credentials using the service
      const validationResult =
        await sfCredentialService.validateAndStoreCredentials(payload);

      // Handle validation errors
      if (validationResult.error) {
        return reply.status(400).send(validationResult);
      }

      // Send success response
      reply.send("Successfully stored Client ID in Secret Manager");
    } catch (error) {
      // Handle unexpected errors
      reply.status(500).send(error.message);
    }
  },
};
