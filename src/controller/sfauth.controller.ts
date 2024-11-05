import { sfauthService } from "../service/sfauth.service.js";

export const sfauthController = {
  async sfauth(request, reply) {
    try {
      //   let Payload = request.body;
      //   console.log(Payload, "payload is ");
      let validationsalsforce = await sfauthService.getValidToken();
      console.log(validationsalsforce, "validationsalsforce");
      reply.send(validationsalsforce);
      return "sfauthController";
    } catch (error) {
      return error.message;
    }
  },
};
