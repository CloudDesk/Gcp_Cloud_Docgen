import axios from "axios";
import fs from "fs";
import path from "path";
export const fileFetchService = {
    /**
     * Downloads a template file from Salesforce and saves it locally.
     * @param contentVersionId - The ID of the content version in Salesforce.
     * @param accessToken - The access token for Salesforce API.
     * @param instanceUrl - The base URL of the Salesforce instance.
     * @returns A promise that resolves to an object indicating success or failure.
     */
    async downloadAndSaveTemplate(fileName, contentVersionId, accessToken, instanceUrl) {
        const __dirname = path.resolve();
        const apiVersion = "v57.0";
        const requestUrl = this.constructSalesforceUrl(instanceUrl, apiVersion, contentVersionId);
        try {
            const response = await this.fetchFileFromSalesforce(requestUrl, accessToken);
            const filePath = path.join(__dirname, "templates", `${fileName}.docx`);
            const relativeFilePath = path.join("templates", `${fileName}.docx`);
            await this.ensureDirectoryExists(filePath);
            fs.writeFileSync(filePath, response.data);
            return {
                success: true,
                message: "File downloaded and saved as .docx successfully!",
                relativeFilePath,
            };
        }
        catch (error) {
            console.error("Error downloading file:", error.response ? error.response.data : error.message);
            return {
                success: false,
                message: "Failed to download and save the file.",
            };
        }
    },
    /**
     * Constructs the URL for the Salesforce API request.
     * @param instanceUrl - The base URL of the Salesforce instance.
     * @param apiVersion - The API version to use.
     * @param contentVersionId - The ID of the content version in Salesforce.
     * @returns The constructed URL as a string.
     */
    constructSalesforceUrl(instanceUrl, apiVersion, contentVersionId) {
        return `${instanceUrl}/services/data/${apiVersion}/sobjects/ContentVersion/${contentVersionId}/VersionData`;
    },
    /**
     * Fetches the file from Salesforce using the provided URL and access token.
     * @param url - The URL to fetch the file from.
     * @param accessToken - The access token for Salesforce API.
     * @returns A promise that resolves to the Axios response.
     */
    async fetchFileFromSalesforce(url, accessToken) {
        return axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            responseType: "arraybuffer",
        });
    },
    /**
     * Ensures that the directory for the given file path exists.
     * @param filePath - The file path for which to ensure directory existence.
     */
    async ensureDirectoryExists(filePath) {
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    },
};
//# sourceMappingURL=fileFetch.service.js.map