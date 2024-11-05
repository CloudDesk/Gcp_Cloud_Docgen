import { sfvalidationService } from "../service/sfvalidation.service.js";
export const sfvalidationController = {
    async sfvalidation(request, reply) {
        try {
            let Payload = request.body;
            console.log(Payload, 'payload is ');
            let validationsalsforce = await sfvalidationService.sfvalidationService(Payload);
            reply.send(validationsalsforce);
        }
        catch (error) {
            reply.send(error.message);
        }
    }
};
//# sourceMappingURL=sfvalidation.controller.js.map