

export const processDocumentService = {
  async getsalesforcedata(documentData) {
    const { orgID, userName, recordID, fileName, templateURL, fieldData } = documentData;
    console.log(documentData, 'documentData');
    try {


      return { success: documentData };
    } catch (error) {
      return ({ error: error.message })
    }
  }
}

