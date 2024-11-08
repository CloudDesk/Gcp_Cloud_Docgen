import fs from "fs";
import path from "path";
import { templateController } from "../../controller/fileFetch.controller.js";
import { sfAuthController } from "../../controller/sfauth.controller.js";
import { generatePdfsFromTemplate } from "./helperMethods/generateDocument.js";
import { uploadFile } from "../sf/fileupload2.service.js";
export const processDocumentService = {
    /**
     * Generates a document based on the provided data and uploads it to Salesforce.
     * @param {Object} documentData - The data required to generate the document.
     * @returns {Promise<Object>} - The result of the document generation and upload process.
     */
    async generateDocument(documentData) {
        const __dirname = path.resolve();
        console.log("Starting document generation...");
        const { orgId, userName, recordId, fileName, contentVersionId, fieldData } = documentData;
        console.log(documentData, "Document data received");
        // Authenticate with Salesforce
        let sfConn;
        try {
            sfConn = await sfAuthController.authenticate(orgId, userName);
            console.log(sfConn, "Salesforce connection established");
        }
        catch (error) {
            console.error("Salesforce authentication failed", error);
            return { error: "Salesforce authentication failed" };
        }
        // Fetch the template from Salesforce
        let template;
        try {
            template = await templateController.fetchTemplate(sfConn.data, contentVersionId, fileName);
            console.log(template, "Template fetched successfully");
        }
        catch (error) {
            console.error("Failed to fetch template", error);
            return { error: "Failed to fetch template" };
        }
        const templateFilePath = path.join(__dirname, template.relativeFilePath);
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
            const uploadResults = await Promise.all(generatedDocument.pdfFilePaths.map((filePath) => uploadFile(sfConn.data, filePath, recordId)));
            console.log(uploadResults, "Document uploaded to Salesforce successfully");
            if (uploadResults.every((result) => result.success)) {
                generatedDocument.pdfFilePaths.forEach((filePath) => fs.unlinkSync(filePath));
            }
            if (uploadResults.every((result) => result.success)) {
                fs.unlinkSync(template.relativeFilePath);
            }
        }
        catch (error) {
            console.error("Failed to upload document to Salesforce", error);
            return { error: "Failed to upload document to Salesforce" };
        }
        return { success: documentData };
    },
};
//# sourceMappingURL=document.service.js.map