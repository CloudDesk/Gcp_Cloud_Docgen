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
    console.log(response, 'response in createContentVersion');
    return response.data.id;
}
/**
 * Retrieves the ContentDocumentId associated with a ContentVersion.
 * @param auth - The authentication object containing instance URL and access token.
 * @param contentVersionId - The ID of the ContentVersion.
 * @returns The ContentDocumentId.
 */
async function getContentDocumentId(auth, contentVersionId) {
    console.log('inside getContentDocumentId');
    console.log(auth.instanceUrl, 'auth.instanceUrl in getContentDocumentId');
    console.log(`${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/${contentVersionId}`, 'Version Id');
    const response = await axios.get(`${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/${contentVersionId}`, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
        },
    });
    console.log(response.data, 'response in getContentDocumentId');
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
    console.log(contentDocumentId, 'contentDocumentId in createContentDocumentLink');
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
    console.log(response.data, 'response in createContentDocumentLink');
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
        console.log(auth.accessToken, "Access token in uploadFile");
        const base64FileContent = await readFileAsBase64(filePath);
        const fileName = filePath.split("/").pop() || "unknown";
        console.log(fileName, 'file name in uploadFile');
        const contentVersionId = await createContentVersion(auth, base64FileContent, fileName);
        console.log(contentVersionId, 'contentVersionId in uploadFile');
        const contentDocumentId = await getContentDocumentId(auth, contentVersionId);
        console.log(contentDocumentId, 'contentDocumentId in uploadFile');
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
        console.log(error.message, 'Error in uploadFile');
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
        return {
            success: false,
            message: error.response.data[0].message,
        };
    }
}
//# sourceMappingURL=fileupload.service.js.map