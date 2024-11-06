import { sfvalidationService } from "../service/sfvalidation.service.js";
interface Payload {
    clientId: string;
    orgId: string;
}
export const sfvalidationController = {
    async sfvalidation(request, reply) {
        try {
            let Payload: Payload = request.body;
            console.log(Payload, 'payload is ');
            let validationsalsforce = await sfvalidationService.sfvalidationService(Payload);
            if(validationsalsforce.error){
                reply.status(400).send(validationsalsforce)
            }
            reply.send("Successfully Stored  Client Id  in Secret Manager");
        } catch (error) {
            reply.send(error.message)
        }
    }

}
