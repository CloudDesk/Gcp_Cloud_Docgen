import { sfauthService } from "../service/sfauth.service.js";

export const sfauthController = {
  async sfauth(request, reply) {
    try {
      //   let Payload = request.body;
      //   console.log(Payload, "payload is ");
      let validationsalesforce = await sfauthService.getValidToken();
      console.log(validationsalesforce, "validationsalesforce is ");
      reply.send({ data: validationsalesforce });
      //   return "sfauthController";
    } catch (error) {
      return error.message;
    }
  },
};
