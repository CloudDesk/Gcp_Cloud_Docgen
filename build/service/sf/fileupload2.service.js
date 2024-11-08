import axios from "axios";
import fs from "fs/promises";
/**
 * Reads a file and returns its content as a Base64 encoded string.
 * @param filePath - The path to the file.
 * @returns The Base64 encoded content of the file.
 */
async function readFileAsBase64(filePath) {
    const fileContent = await fs.readFile(filePath);
    return fileContent.toString("base64");
}
/**
 * Creates a ContentVersion in Salesforce.
 * @param auth - The authentication object containing instance URL and access token.
 * @param base64FileContent - The Base64 encoded content of the file.
 * @param fileName - The name of the file.
 * @returns The ID of the created ContentVersion.
 */
async function createContentVersion(auth, base64FileContent, fileName) {
    const response = await axios.post(`${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/`, {
        Title: fileName,
        PathOnClient: fileName,
        VersionData: base64FileContent,
    }, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
        },
    });
    return response.data.id;
}
/**
 * Retrieves the ContentDocumentId associated with a ContentVersion.
 * @param auth - The authentication object containing instance URL and access token.
 * @param contentVersionId - The ID of the ContentVersion.
 * @returns The ContentDocumentId.
 */
async function getContentDocumentId(auth, contentVersionId) {
    const response = await axios.get(`${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/${contentVersionId}`, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
        },
    });
    return response.data.ContentDocumentId;
}
/**
 * Creates a ContentDocumentLink in Salesforce.
 * @param auth - The authentication object containing instance URL and access token.
 * @param contentDocumentId - The ID of the ContentDocument.
 * @param recordId - The ID of the record to link the document to.
 * @returns The ID of the created ContentDocumentLink.
 */
async function createContentDocumentLink(auth, contentDocumentId, recordId) {
    const response = await axios.post(`${auth.instanceUrl}/services/data/v57.0/sobjects/ContentDocumentLink/`, {
        ContentDocumentId: contentDocumentId,
        LinkedEntityId: recordId,
        ShareType: "V",
        Visibility: "AllUsers",
    }, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
        },
    });
    return response.data.id;
}
/**
 * Uploads a file to Salesforce and links it to a specified record.
 * @param auth - The authentication object containing instance URL and access token.
 * @param filePath - The path to the file to be uploaded.
 * @param recordId - The ID of the record to link the file to.
 * @returns A message indicating the success of the operation.
 */
export async function uploadFile(auth, filePath, recordId) {
    try {
        const base64FileContent = await readFileAsBase64(filePath);
        const fileName = filePath.split("/").pop() || "unknown";
        const contentVersionId = await createContentVersion(auth, base64FileContent, fileName);
        const contentDocumentId = await getContentDocumentId(auth, contentVersionId);
        const contentDocumentLinkId = await createContentDocumentLink(auth, contentDocumentId, recordId);
        console.log("File uploaded successfully and linked to record");
        console.log("ContentDocumentLink ID:", contentDocumentLinkId);
        return {
            success: true,
            message: "File uploaded successfully and linked to record",
            contentVersionId,
            contentDocumentId,
            contentDocumentLinkId,
        };
    }
    catch (error) {
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
    }
}
//# sourceMappingURL=fileupload2.service.js.map