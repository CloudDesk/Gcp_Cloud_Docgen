import { jest } from '@jest/globals';
import { CloudTasksClient } from '@google-cloud/tasks';
import { createHttpTask } from '../service/gcp/googletask.service';

// Mock the entire @google-cloud/tasks module
jest.mock('@google-cloud/tasks');

type TaskResponse = {
    name: string;
};

interface ServiceAccountCredentials {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}
interface MockClient {
    request: jest.Mock;
}
jest.mock('google-auth-library', () => {
    return {
        GoogleAuth: jest.fn().mockImplementation(() => ({
            getClient: jest.fn().mockImplementation(async () => {
                // Explicitly type the mock client
                const mockClient: MockClient = {
                    request: jest.fn().mockResolvedValue({} as never)
                };
                return mockClient as any;
            }),
            getCredentials: jest.fn().mockImplementation(async () => {
                const credentials: ServiceAccountCredentials = {
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
                return credentials;
            }) 
        })),
    };
});

// Mock the entire module
jest.mock('@google-cloud/tasks', () => {
    const originalModule: any = jest.requireActual('@google-cloud/tasks');
    return {
        __esModule: true,
        ...originalModule,
        CloudTasksClient: jest.fn().mockImplementation(() => ({
            queuePath: jest.fn().mockReturnValue('projects/test-project/locations/us-central1/queues/test-queue'),
            createTask: jest.fn().mockImplementation(() =>
                Promise.resolve([{ name: 'test-task-name' } as TaskResponse])
            ),
        })),
    };
});

describe('createHttpTask', () => {
    // Mock task response
    const mockTaskResponse = {
        name: 'projects/test-project/locations/us-central1/queues/test-queue/tasks/test-task-id',
    };

    // Sample payload for testing
    const samplePayload = {
        "orgId": "00DJK00000BoiXu",
        "recordId": "001WU00000Tv8bLYAR",
        "userName": "cddev@org.com",
        "fileName": "Account",
        "contentVersionId": "068WU000005cbuvYAA",
        "fieldData": [
            {
                "Account": {
                    "Name": "Financial Insights LLC from local from cloud task",
                    "BillingStreet": "",
                    "BillingCity": "Boston",
                    "BillingCountry": "USA",
                    "Phone": "+1 555-7890"
                },
                "OpportunityLineItems": {
                    "records": {
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
            }
        ]
    }

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });



    it("should send the correct payload to Google Cloud Tasks", async () => {


        // Explicitly type the mocked client
        const mockClient = new CloudTasksClient() as unknown as jest.Mocked<{
            queuePath: jest.Mock;
            createTask: jest.Mock;
            auth: { getCredentials: jest.Mock };
        }>;

        const response = await createHttpTask(samplePayload);
        console.log(response.httpRequest.url, 'response.url');
        // Assert the response
        expect(response.httpRequest.url).toEqual("https://docgen-dev-1027746116534.us-central1.run.app/api/v1/salesforce/process-document");
    });
});