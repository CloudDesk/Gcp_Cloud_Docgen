import { API_KEY } from '../config/config.js';
import { jest } from '@jest/globals';
import fs from 'fs/promises';
// Define types for Secret Manager responses
import axios from 'axios';
jest.mock('axios');
// Mock Salesforce token response for POST to /services/oauth2/token
const mockSalesforceTokenResponse = {
    access_token: "00Dxx0000000abp!AR8AQJWqh1x7k58Z.H9C4JsNkAY3Fy4SkNIfpj92DEmE5QZbLuy3Ww5EIb12mR2OtReb9I3nHrG1jvdsuNqS6ROVPZCcTqjf",
    instance_url: 'https://clouddesktechnology71-dev-ed.develop.my.salesforce.com',
};
// Mock all necessary axios methods
jest.spyOn(axios, 'post').mockImplementation((url, data) => {
    console.log("POST Request URL:", url); // Debugging line
    if (url === 'https://login.salesforce.com/services/oauth2/token') {
        return Promise.resolve({
            data: mockSalesforceTokenResponse,
        });
    }
    if (url.includes('https://clouddesktechnology71-dev-ed.develop.my.salesforce.com/services/data/v57.0/sobjects/ContentVersion/')) {
        return Promise.resolve({
            data: {
                id: '068WU000005XtinYAC',
                success: true,
            },
        });
    }
    if (url.includes('/services/data/v57.0/sobjects/ContentDocumentLink/')) {
        console.log('inside content doument kink function test');
        console.log('inside next function');
        // Simulate binary file content (Buffer or ArrayBuffer)
        return Promise.resolve({
            data: {
                id: "069WU000006Yx0bYAC"
            }
        });
    }
    console.log("Unknown POST Request URL:", url); // Debugging line
    return Promise.reject(new Error('Unknown URL'));
});
const readDocxFile = async (filePath) => {
    try {
        // Read file as a buffer
        const docxBuffer = await fs.readFile(filePath);
        // Log the buffer content (this will be binary data)
        // Example: Convert buffer to string if needed (for debugging or processing)
        const fileContent = docxBuffer.toString();
        return docxBuffer; // You can return the buffer for further use
    }
    catch (err) {
        console.error('Error reading file:', err);
    }
};
jest.spyOn(axios, 'get').mockImplementation(async (url, config) => {
    console.log(url, 'URL for get request');
    const filePath = 'src/tests/template/Account.docx';
    let docxbuffer = await readDocxFile(filePath);
    // Simulate the case where you're fetching file content, not Account data.
    if (url.includes('/services/data/v57.0/sobjects/ContentVersion/068WU000005Ukk5YAC/VersionData')) {
        // Simulating binary file content (a buffer or arraybuffer)
        const fileBuffer = Buffer.from(docxbuffer);
        return Promise.resolve({
            data: fileBuffer, // Return the simulated file content as a Buffer
        });
    }
    // For other URLs, return a mock response with JSON data (this could be for other Salesforce endpoints)
    if (url.includes('/services/data/v57.0/sobjects/Account/068WU000005Ukk5YAC')) {
        console.log('inside the mock get  request is ');
        return Promise.resolve({
            data: {
                Id: '068WU000005Ukk5YAC',
                Name: 'Financial Insights LLC',
            },
        });
    }
    // Handle the correct ContentVersion URL format without /VersionData
    if (url.includes('/services/data/v57.0/sobjects/ContentVersion/068WU000005XtinYAC')) {
        console.log('Matched ContentVersion URL');
        // Simulate binary file content (Buffer or ArrayBuffer)
        const fileBuffer = Buffer.from(docxbuffer);
        return Promise.resolve({
            data: {
                ContentDocumentId: "069WU000006Yx0bYAC"
            }
        });
    }
    console.error('Unknown URL: ', url); // Log the unknown URL that was triggered
    return Promise.reject(new Error('Unknown URL'));
});
// Mock service account data
const mockServiceAccount = {
    type: "service_account",
    project_id: "gcp-project-id",
    private_key_id: "474a5abdc6da8a2cdcfSc3141f21d74db91d4792",
    private_key: "-----BEGIN PRIVATE KEY-----\nfeahsdkhkahjsdgihohjwerofdsknbvcbmzbjhjashedfncknhgfbkblkdsahk\n-----END PRIVATE KEY-----\n",
    client_email: "mock-service@your-project.iam.gserviceaccount.com",
    client_id: "119178689018994015340",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mock-service%40your-project.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
};
const mockAccessSecretVersion = jest.fn().mockResolvedValue([
    {
        payload: {
            data: Buffer.from(JSON.stringify(mockServiceAccount)),
        },
    },
    undefined,
    undefined
]);
const mockAddSecretVersion = jest.fn().mockResolvedValue([
    {
        name: 'projects/123/secrets/test-secret/versions/1',
        state: 'ENABLED',
        createTime: new Date(),
    },
    undefined,
    undefined
]);
const mockCreateSecret = jest.fn().mockResolvedValue([
    {
        name: 'projects/123/secrets/test-secret',
    },
]);
// Mock the Secret Manager module with all necessary methods
jest.mock('@google-cloud/secret-manager', () => ({
    SecretManagerServiceClient: jest.fn().mockImplementation(() => ({
        accessSecretVersion: mockAccessSecretVersion,
        addSecretVersion: mockAddSecretVersion,
        createSecret: mockCreateSecret,
        projectPath: jest.fn().mockReturnValue('projects/123'),
        secretPath: jest.fn().mockReturnValue('projects/123/secrets/test-secret'),
        secretVersionPath: jest.fn().mockReturnValue('projects/123/secrets/test-secret/versions/1')
    }))
}));
// Import the app after setting up all mocks
let initializeApp;
describe('POST /api/v1/salesforce/process-document', () => {
    let fastify;
    beforeAll(async () => {
        const appModule = await import('../index.js');
        initializeApp = appModule.initializeApp;
        console.log("Initializing Fastify app...");
        fastify = await initializeApp();
        console.log("Fastify app initialized:", fastify);
    });
    afterAll(async () => {
        await fastify.close();
        jest.clearAllMocks();
    });
    it('should validate the Body and process the document Return 200 status code', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiXu",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005Ukk5YAC",
            "fieldData": [
                {
                    "Account": {
                        "Name": "Financial Insights LLC",
                        "BillingStreet": "",
                        "BillingCity": "Boston",
                        "BillingCountry": "USA",
                        "Phone": "+1 555-7890"
                    },
                    "ProductDetails": {
                        "Name": "Financial Analysis Tool Investment Strategy Simulator",
                        "Product2": {
                            "Name": "Investment Strategy Simulator"
                        },
                        "Quantity": 6,
                        "UnitPrice": 299,
                        "TotalPrice": 1794,
                        "Discount__c": 10,
                        "DiscountAmtQI__c": 179.4,
                        "DiscountedFinalQIPrice__c": 1614.6
                    }
                }
            ]
        };
        console.log(requestBody, 'requestBody for validation test case');
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/v1/salesforce/process-document',
            payload: requestBody,
            headers: {
                'X-API-KEY': API_KEY,
            },
        });
        console.log(response, 'Response for process document 200 sucess code test case');
        console.log(response.statusCode, 'Response for process document 200 sucess code test case');
        expect(response.statusCode).toBe(200);
    });
    it('should validate the Body and process the document Return 200 status code with string', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiXu",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005Ukk5YAC",
            "fieldData": "\"[{\"Account\": {\"Name\": \"Financial Insights LLC\",\"BillingStreet\": \"New Street\",\"BillingCity\": \"Boston\",\"BillingCountry\": \"USA\",\"Phone\": \"+1 555-7890\"},\"OpportunityLineItems\":{\"records\": {\"Name\": \"Financial Analysis Tool Investment Strategy Simulator\",\"Product2\": {\"Name\": \"Investment Strategy Simulator\"},\"Quantity\": 6,\"UnitPrice\": 299,\"TotalPrice\": 1794,\"Discount__c\": 10,\"DiscountAmtQI__c\": 179.4,\"DiscountedFinalQIPrice__c\": 1614.6}}}]\""
        };
        console.log(requestBody, 'requestBody for validation test case');
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/v1/salesforce/process-document',
            payload: requestBody,
            headers: {
                'X-API-KEY': API_KEY,
            },
        });
        console.log(response, 'Response for process document 200 sucess code test case');
        console.log(response.statusCode, 'Response for process document 200 sucess code test case');
        expect(response.statusCode).toBe(200);
    });
    it('Should Retrun 400 from wrong content version Id', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiXu",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005PAisYAM",
            "fieldData": [
                {
                    "Account": {
                        "Name": "Financial Insights LLC",
                        "BillingStreet": "",
                        "BillingCity": "Boston",
                        "BillingCountry": "USA",
                        "Phone": "+1 555-7890"
                    },
                    "ProductDetails": {
                        "Name": "Financial Analysis Tool Investment Strategy Simulator",
                        "Product2": {
                            "Name": "Investment Strategy Simulator"
                        },
                        "Quantity": 6,
                        "UnitPrice": 299,
                        "TotalPrice": 1794,
                        "Discount__c": 10,
                        "DiscountAmtQI__c": 179.4,
                        "DiscountedFinalQIPrice__c": 1614.6
                    }
                }
            ]
        };
        console.log(requestBody, 'requestBody');
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/v1/salesforce/process-document',
            payload: requestBody,
            headers: {
                'X-API-KEY': API_KEY,
            },
        });
        console.log(response.statusCode, 'Response for process document');
        expect(response.statusCode).toBe(400);
    });
    it('should validate the Body and process the document Return 400 status code', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiXu",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005J3aPYAK",
            "fieldData": [
                {
                    "Account": {
                        "Name": "Financial Insights LLC",
                        "BillingStreet": "",
                        "BillingCity": "Boston",
                        "BillingCountry": "USA",
                        "Phone": "+1 555-7890"
                    },
                    "ProductDetails": {
                        "Name": "Financial Analysis Tool Investment Strategy Simulator",
                        "Product2": {
                            "Name": "Investment Strategy Simulator"
                        },
                        "Quantity": 6,
                        "UnitPrice": 299,
                        "TotalPrice": 1794,
                        "Discount__c": 10,
                        "DiscountAmtQI__c": 179.4,
                        "DiscountedFinalQIPrice__c": 1614.6
                    }
                }
            ]
        };
        console.log(requestBody, 'requestBody');
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/v1/salesforce/process-document',
            payload: requestBody,
            headers: {
                'X-API-KEY': API_KEY,
            },
        });
        console.log(response, 'Response for process document');
        expect(response.statusCode).toBe(400);
    });
    it('should validate the Body and process the document Return 400 status code', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiX",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005J3aPYAK",
            "fieldData": [
                {
                    "Account": {
                        "Name": "Financial Insights LLC",
                        "BillingStreet": "",
                        "BillingCity": "Boston",
                        "BillingCountry": "USA",
                        "Phone": "+1 555-7890"
                    },
                    "ProductDetails": {
                        "Name": "Financial Analysis Tool Investment Strategy Simulator",
                        "Product2": {
                            "Name": "Investment Strategy Simulator"
                        },
                        "Quantity": 6,
                        "UnitPrice": 299,
                        "TotalPrice": 1794,
                        "Discount__c": 10,
                        "DiscountAmtQI__c": 179.4,
                        "DiscountedFinalQIPrice__c": 1614.6
                    }
                }
            ]
        };
        console.log(requestBody, 'requestBody');
        const response = await fastify.inject({
            method: 'POST',
            url: '/api/v1/salesforce/process-document',
            payload: requestBody,
            headers: {
                'X-API-KEY': API_KEY,
            },
        });
        console.log(response, 'Response for process document');
        expect(response.statusCode).toBe(400);
    });
});
//# sourceMappingURL=process-document-router.test.js.map