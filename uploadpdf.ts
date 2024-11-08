import axios from "axios";
import fs from "fs";
import { sfAuthService } from "./src/service/sf/auth.service.js";

const filePath = "templates/sample.pdf";
const recordId = "001WU00000Tv8bLYAR";

async function getAuthToken() {
  return await sfAuthService.getAccessToken();
}

function readFileAsBase64(filePath: string): string {
  const fileContent = fs.readFileSync(filePath);
  return fileContent.toString("base64");
}

async function createContentVersion(
  auth: any,
  base64FileContent: string,
  fileName: string
) {
  const response = await axios.post(
    `${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/`,
    {
      Title: fileName,
      PathOnClient: fileName,
      VersionData: base64FileContent,
    },
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.id;
}

async function getContentDocumentId(auth: any, contentVersionId: string) {
  const response = await axios.get(
    `${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/${contentVersionId}`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );
  return response.data.ContentDocumentId;
}

async function createContentDocumentLink(
  auth: any,
  contentDocumentId: string,
  recordId: string
) {
  const response = await axios.post(
    `${auth.instanceUrl}/services/data/v57.0/sobjects/ContentDocumentLink/`,
    {
      ContentDocumentId: contentDocumentId,
      LinkedEntityId: recordId,
      ShareType: "V",
      Visibility: "AllUsers",
    },
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.id;
}

export async function uploadFile() {
  try {
    const auth = await getAuthToken();
    console.log(auth, "auth is ");

    const base64FileContent = readFileAsBase64(filePath);
    const fileName = filePath.split("/").pop();

    const contentVersionId = await createContentVersion(
      auth,
      base64FileContent,
      fileName
    );
    console.log("ContentVersion ID:", contentVersionId);

    const contentDocumentId = await getContentDocumentId(
      auth,
      contentVersionId
    );
    console.log("ContentDocumentId:", contentDocumentId);

    const contentDocumentLinkId = await createContentDocumentLink(
      auth,
      contentDocumentId,
      recordId
    );
    console.log("File uploaded successfully and linked to record");
    console.log("ContentDocumentLink ID:", contentDocumentLinkId);
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response ? error.response.data : error.message
    );
  }
}
