import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

interface SalesforceConnection {
    INSTANCE_URL: string;
    ACCESS_TOKEN: string;
}

const getContentDocumentId = async (sfConn: SalesforceConnection, recordId: string, fileName: string): Promise<string | null> => {
    const query = `SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId='${recordId}' AND ContentDocument.Title='${fileName}' LIMIT 1`;
    const response = await axios.get(
        `${sfConn.INSTANCE_URL}/services/data/v57.0/query?q=${encodeURIComponent(query)}`,
        {
            headers: {
                'Authorization': `Bearer ${sfConn.ACCESS_TOKEN}`
            }
        }
    );

    return response.data.records.length > 0 ? response.data.records[0].ContentDocumentId : null;
};

const createContentVersion = async (sfConn: SalesforceConnection, fileContent: Buffer, fileName: string, contentDocumentId?: string) => {
    const form = new FormData();
    const entityContent: any = {
        Title: fileName,
        PathOnClient: fileName,
        VersionData: fileContent.toString('base64')
    };

    if (contentDocumentId) {
        entityContent['ContentDocumentId'] = contentDocumentId;
    }

    form.append('entity_content', JSON.stringify(entityContent), {
        contentType: 'application/json'
    });

    form.append('VersionData', fileContent, {
        filename: fileName,
        contentType: 'application/octet-stream',
    });

    const response = await axios.post(
        `${sfConn.INSTANCE_URL}/services/data/v57.0/sobjects/ContentVersion`,
        form,
        {
            headers: {
                'Authorization': `Bearer ${sfConn.ACCESS_TOKEN}`,
                ...form.getHeaders(),
            },
        }
    );

    return response.data.id;
};

const linkContentDocument = async (sfConn: SalesforceConnection, contentDocumentId: string, recordId: string) => {
    await axios.post(
        `${sfConn.INSTANCE_URL}/services/data/v57.0/sobjects/ContentDocumentLink`,
        {
            ContentDocumentId: contentDocumentId,
            LinkedEntityId: recordId,
            ShareType: 'V',
            Visibility: 'AllUsers',
        },
        {
            headers: {
                'Authorization': `Bearer ${sfConn.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        }
    );
};

const uploadFileToSalesforce = async (sfConn: SalesforceConnection, filePath: string, recordId: string, fileName = 'Default') => {
    const fileContent = fs.readFileSync(filePath);

    try {
        let contentDocumentId = await getContentDocumentId(sfConn, recordId, fileName);

        const newContentDocumentId = await createContentVersion(sfConn, fileContent, fileName, contentDocumentId);

        if (!contentDocumentId) {
            await linkContentDocument(sfConn, newContentDocumentId, recordId);
            console.log(`New file uploaded and linked to record with ID: ${recordId}`);
        } else {
            console.log(`New version added to existing file for ContentDocumentId: ${contentDocumentId}`);
        }
    } catch (error) {
        console.error(`Failed to upload file: ${error}`);
    }
};

export { uploadFileToSalesforce };