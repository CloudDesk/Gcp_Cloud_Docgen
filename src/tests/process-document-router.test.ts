import { initializeApp } from '../index.js';
import { API_KEY } from '../config/config.js';

describe('POST /api/v1/salesforce/process-document', () => {
    let fastify: any;
    beforeAll(async () => {
        fastify = await initializeApp(); // Initialize the app instance
    });;


    it('should validate the Body and process the document Return 200 status code', async () => {
        const requestBody = {
            "orgId": "00DWU00000BoiXu",
            "userName": "cddev@org.com",
            "recordId": "001WU00000Tv8bLYAR",
            "fileName": "Account",
            "contentVersionId": "068WU000005PAisYAG",
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
        }
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
        }
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
        }
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
        }
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