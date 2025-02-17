import { createHttpTask } from "../service/gcp/googletask.service.js";
export const documentControllerTask = {
    async processDocumentTask(request, reply) {
        try {
            // Call the service to generate the document
            let taskResult = await createHttpTask(request.body);
            console.log(taskResult, 'taskResult');
            reply.send("Step to create task entry");
        }
        catch (error) {
            // Log the error and rethrow it
            request.log.error("Exception occurred while processing document:", error);
            return error;
        }
    },
};
//# sourceMappingURL=documenttask.controller.js.map