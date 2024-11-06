import { processDocumentService } from "../service/document.service.js";


export const processDocumentController = {
    async processDocument(request, reply) {
      try {
        const result = await processDocumentService.getsalesforcedata(request.body)
        if(result.success){
          console.log(result);
          return reply.code(200).send(result.success);
        }
        else {
          return reply.code(400).send(result.error);
        }
        
      } catch (error) {
        request.log.error(error);
        throw error;
      }
    }
}
