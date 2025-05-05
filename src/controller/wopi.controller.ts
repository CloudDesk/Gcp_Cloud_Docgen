import { wopiService } from "../service/wopi/wopi.service.js";

export const wopiController = {

    async getWopi(req: any, reply: any) {
        try {
            const wopiData = await wopiService.fetchTemplateData(req, reply);
            console.log(wopiData, 'WOPI DATA');
            if (wopiData && wopiData.error) {
                return reply.status(400).send({ error: wopiData.error });
            }
            else {
                console.log(wopiData, 'else WOPI DATA');

                reply.send(wopiData);

            }
        } catch (error) {
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    },

    async getWopiContent(req, reply) {
        try {
            const wopiContentResult = await wopiService.fetchWopiContent(req, reply);
            console.log(wopiContentResult, 'WOPI CONTENT DATA');
          
                console.log(wopiContentResult, 'else WOPI CONTENT DATA');

                reply.send(wopiContentResult);
            
        } catch (error) {
            console.log('error in get wopi content', error);
            reply.status(500).send({ error: error.message });
        }
    }

}