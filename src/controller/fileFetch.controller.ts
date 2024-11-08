import { fileFetchService } from "../service/sf/fileFetch.service.js";

export const templateController = {
  /**
   * Fetches and saves a template using the file fetch service.
   *
   * @param {Object} sfConn - Salesforce connection object containing accessToken and instanceUrl.
   * @param {string} contentVersionId - The ID of the content version to fetch.
   * @param {string} fileName - The name of the file to save the template as.
   * @returns {Promise<Object>} - The fetched template data or an error object.
   */
  async fetchTemplate(sfConn, contentVersionId, fileName) {
    try {
      // Destructure necessary properties from the Salesforce connection object
      const { accessToken, instanceUrl } = sfConn;

      // Fetch and save the template using the file fetch service
      const templateData = await fileFetchService.downloadAndSaveTemplate(
        fileName,
        contentVersionId,
        accessToken,
        instanceUrl
      );

      console.log("Template fetched successfully:", templateData);
      return templateData;
    } catch (error) {
      console.error("Error fetching template:", error);
      return { error: "Internal Server Error" };
    }
  },
};
