import axios from "axios";
import fs from "fs";
import { sfauthService } from "./src/service/sfauth.service.js";

const auth = await sfauthService.getValidToken();
console.log(auth, "auth is ");

const filePath = "templates/sample.pdf";
const recordId = "001WU00000Tv8bLYAR";

export async function uploadFile() {
  const fileContent = fs.readFileSync(filePath);
  const base64FileContent = fileContent.toString("base64");
  const fileName = filePath.split("/").pop();

  try {
    // Step 1: Create the ContentVersion
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

    // Step 2: Retrieve ContentDocumentId from ContentVersion
    const contentVersionId = response.data.id;
    console.log("ContentVersion ID:", contentVersionId);

    // Fetch the ContentDocumentId associated with the ContentVersion
    const contentVersionDetails = await axios.get(
      `${auth.instanceUrl}/services/data/v57.0/sobjects/ContentVersion/${contentVersionId}`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );

    const contentDocumentId = contentVersionDetails.data.ContentDocumentId;
    console.log("ContentDocumentId:", contentDocumentId);

    // Step 3: Create the ContentDocumentLink
    const linkResponse = await axios.post(
      `${auth.instanceUrl}/services/data/v57.0/sobjects/ContentDocumentLink/`,
      {
        ContentDocumentId: contentDocumentId,
        LinkedEntityId: recordId, // The ID of the record to associate the file with
        ShareType: "V", // Can be 'V' for Viewer or 'C' for Collaborator
        Visibility: "AllUsers", // Can be 'AllUsers' or 'InternalUsers'
      },
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("File uploaded successfully and linked to record");
    console.log("ContentDocumentLink ID:", linkResponse.data.id);
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response ? error.response.data : error.message
    );
  }
}
