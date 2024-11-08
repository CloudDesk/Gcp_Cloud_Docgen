import { processDocumentService } from "../service/processDocument/document.service.js";
export const documentController = {
    /**
     * Controller method to process a document.
     * @param {Object} request - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Promise<void>}
     */
    async processDocument(request, reply) {
        try {
            console.log("Processing document...");
            // Call the service to generate the document
            const result = await processDocumentService.generateDocument(request.body);
            // Check the result and send appropriate response
            if (result.success) {
                console.log("Document processed successfully:", result);
                return reply.code(200).send(result.success);
            }
            else {
                console.error("Error processing document:", result.error);
                return reply.code(400).send(result.error);
            }
        }
        catch (error) {
            // Log the error and rethrow it
            request.log.error("Exception occurred while processing document:", error);
            throw error;
        }
    },
};
//# sourceMappingURL=document.controller.js.map