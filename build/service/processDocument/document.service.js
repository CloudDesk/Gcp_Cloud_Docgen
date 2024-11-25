import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { generatePdfsFromTemplate } from "./helperMethods/generateDocument.js";
import { uploadFile } from "../sf/fileupload.service.js";
import { sfAuthService } from "../sf/auth.service.js";
import { fileFetchService } from "../sf/fileFetch.service.js";
export const processDocumentService = {
    /**
     * Generates a document based on the provided data and uploads it to Salesforce.
     * @param {Object} documentData - The data required to generate the document.
     * @returns {Promise<Object>} - The result of the document generation and upload process.
     */
    async generateDocument(documentData) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.join(dirname(__filename), "../../../templates");
        console.log(__dirname, "Current directory path");
        console.log("Starting document generation...");
        const { orgId, userName, recordId, fileName, contentVersionId, fieldData } = documentData;
        console.log(documentData, "Document data received");
        // Authenticate with Salesforce
        let sfConn;
        try {
            // sfConn = await sfAuthController.authenticate(orgId, userName);
            sfConn = await sfAuthService.getAccessToken(orgId, userName);
            console.log(sfConn, "Salesforce connection established");
        }
        catch (error) {
            console.error("Salesforce authentication failed", error);
            return { error: "Salesforce authentication failed" };
        }
        // Fetch the template from Salesforce
        let template;
        try {
            // template = await templateController.fetchTemplate(
            //   sfConn.data,
            //   contentVersionId,
            //   fileName
            // );
            template = await fileFetchService.downloadAndSaveTemplate(fileName, contentVersionId, sfConn.accessToken, sfConn.instanceUrl);
            console.log(template, "Template fetched successfully");
            if (!template.success) {
                return { error: "Failed to fetch template.Please Provide correct contentVersionId" };
            }
        }
        catch (error) {
            console.error("Failed to fetch template", error);
            return { error: "Failed to fetch template" + error.message };
        }
        console.log(__dirname, "Current directory path");
        const templateFilePath = path.join(__dirname, "..", template.relativeFilePath);
        console.log(templateFilePath, "Template file path resolved");
        // Generate the document from the template
        let generatedDocument;
        try {
            generatedDocument = await generatePdfsFromTemplate(templateFilePath, fieldData, fileName);
            console.log(generatedDocument, "Document generated successfully");
        }
        catch (error) {
            console.error("Document generation failed", error);
            return { error: "Document generation failed" };
        }
        // Upload the generated document to Salesforce
        try {
            const uploadResults = await Promise.all(generatedDocument.pdfFilePaths.map((filePath) => uploadFile(sfConn, filePath, recordId)));
            console.log(uploadResults, "Document uploaded to Salesforce successfully");
            if (uploadResults.every((result) => result.success)) {
                generatedDocument.pdfFilePaths.forEach((filePath) => fs.unlinkSync(filePath));
            }
            if (uploadResults.every((result) => result.success)) {
                fs.unlinkSync(template.relativeFilePath);
            }
            return {
                success: true,
                message: "Document uploaded to Salesforce successfully",
            };
        }
        catch (error) {
            console.error("Failed to upload document to Salesforce", error);
            return { error: "Failed to upload document to Salesforce" };
        }
    },
};
//# sourceMappingURL=document.service.js.map