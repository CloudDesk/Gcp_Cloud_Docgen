import { sfauthService } from "../service/sfauth.service.js";
import { templateService } from "../service/template.service.js";

export const templateController = {
  async getTemplate(request, reply) {
    try {
      const sfAuthToken = await sfauthService.getValidToken();
      console.log(`${sfAuthToken} sfAuthToken is`);

      const contentVersionId = "068WU0000054wYnYAI";
      const { accessToken, instanceUrl } = sfAuthToken;

      const templateResult = await templateService.downloadAndSaveTemplate(
        contentVersionId,
        accessToken,
        instanceUrl
      );

      console.log("templateResult is", templateResult);
      reply.send(templateResult);
    } catch (error) {
      console.error("Error fetching template:", error);
      reply.status(500).send({ error: error.message });
    }
  },
};
