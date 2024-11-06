import { processDocumentService } from "../service/document.service.js";


export const processDocumentController = {
    async processDocument(request, reply) {
      try {
        const result = await processDocumentService(request.body);
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error(error);
        throw error;
      }
    }
}
