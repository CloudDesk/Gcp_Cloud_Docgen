import { jest } from '@jest/globals';
import { CloudTasksClient } from '@google-cloud/tasks';
import { createHttpTask } from '../service/gcp/googletask.service';

// Mock the entire @google-cloud/tasks module
jest.mock('@google-cloud/tasks');

type TaskResponse = {
    name: string;
};

// Mock the entire module
jest.mock('@google-cloud/tasks', () => {
    const originalModule: any = jest.requireActual('@google-cloud/tasks');
    return {
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
        }>;

        const response = await createHttpTask(samplePayload);
        console.log(response.httpRequest.url, 'response.url');
        // Assert the response
        expect(response.httpRequest.url).toEqual("https://docgen-dev-1027746116534.us-central1.run.app/api/v1/salesforce/process-document");
    });


    //     // Mock the CloudTasksClient constructor


    //     // @ts-ignore
    //     CloudTasksClient.mockImplementation(() => mockCloudTasksClient);

    //     // Call the function
    //     const result = await createHttpTask(samplePayload);

    //     // Assertions
    //     expect(result).toEqual(mockTaskResponse);

    //     // Verify method calls
    //     expect(mockCloudTasksClient.queuePath).toHaveBeenCalled();
    //     expect(mockCloudTasksClient.createTask).toHaveBeenCalledWith({
    //         parent: 'projects/test-project/locations/us-central1/queues/test-queue',
    //         task: expect.objectContaining({
    //             httpRequest: expect.objectContaining({
    //                 body: expect.any(String),
    //                 httpMethod: 'POST',
    //                 url: 'https://your-endpoint.com/process-task'
    //             })
    //         })
    //     });
    // });

});