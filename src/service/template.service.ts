import axios from "axios";
import fs from "fs";
import path from "path";

export const templateService = {
  async downloadAndSaveTemplate(
    contentVersionId: string,
    accessToken: string,
    instanceUrl: string
  ) {
    const __dirname = path.resolve();
    console.log("Instance URL:", instanceUrl);
    console.log("Access Token:", accessToken);

    try {
      const apiVersion = "v57.0";
      const url = `${instanceUrl}/services/data/${apiVersion}/sobjects/ContentVersion/${contentVersionId}/VersionData`;

      console.log("Request URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "arraybuffer",
      });

      console.log(response, "response is ");
      console.log(response.data, "response.data is ");

      const filePath = path.join(
        __dirname,
        "templates",
        "downloadedTemplate.docx"
      );
      await this.ensureDirectoryExistence(filePath);

      fs.writeFileSync(filePath, response.data);
      return {
        success: true,
        message: "File downloaded and saved as .docx successfully!",
      };
    } catch (error) {
      console.error(
        "Error downloading file:",
        error.response ? error.response.data : error.message
      );
    }
  },

  async ensureDirectoryExistence(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  },
};
