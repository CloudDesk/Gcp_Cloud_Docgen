import dotenv from 'dotenv';
import { initializeApp } from '../index.js';
import { API_KEY, SF_CLIENT_ID, SF_ORG_ID, SF_ORG_ID_TWO } from '../config/config.js';
dotenv.config();

describe('POST Initial test', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = await initializeApp(); // Initialize the app instance
  });

  it('should return  200 ', async () => {
    const response = await fastify.inject({
      method: 'get',
      url: '/',
      headers: {
        'X-API-KEY': API_KEY,
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(200);

  });

  it('should return  200 for test route', async () => {


    const response = await fastify.inject({
      method: 'get',
      url: '/test',
      headers: {
        'X-API-KEY': API_KEY,
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(200);

  });

  it('should return  403  for  wrong API Key ', async () => {
    const response = await fastify.inject({
      method: 'get',
      url: '/test',
      headers: {
        'X-API-KEY': 'wrong api key',
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(403);

  });

})







describe('POST /api/v1/salesforce/store-credentials', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = await initializeApp(); // Initialize the app instance
  });;


  it('should validate the Salesforce credentials and return 200 with correct API key', async () => {
    const requestBody = {
      clientId: SF_CLIENT_ID,
      orgId: SF_ORG_ID,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: requestBody,
      headers: {
        'X-API-KEY': API_KEY,
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(200);

  });

  it('should validate the Salesforce credentials and return 200 with correct API key', async () => {
    const requestBody = {
      clientId: SF_CLIENT_ID,
      orgId: SF_ORG_ID_TWO
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: requestBody,
      headers: {
        'X-API-KEY': API_KEY,
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(200);

  });

  it('should validate the Salesforce credentials and return 403 For wrong API KEY', async () => {
    const requestBody = {
      clientId: SF_CLIENT_ID,
      orgId: SF_ORG_ID,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: requestBody,
      headers: {
        'X-API-KEY': 'wrong api key',
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(403);

  });



  it('should return 400 for invalid request body', async () => {
    const invalidRequestBody = {
      clientId: 'INVALID_CLIENT_ID',
      orgId: 'INVALID_ORG_ID',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: invalidRequestBody,
      headers: {
        'X-API-KEY': API_KEY,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 401 for Not Giving API KEY', async () => {
    const invalidRequestBody = {
      clientId: 'INVALID_CLIENT_ID',
      orgId: 'INVALID_ORG_ID',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: invalidRequestBody,

    });

    expect(response.statusCode).toBe(401);
  });

  it('should return 500 for invalid request body', async () => {
    const invalidPayload = '{ clientId: INVALID_CLIENT_ID, orgId: INVALID_ORG_ID ';
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: invalidPayload,
      headers: {

        'X-API-KEY': API_KEY,
      },
    });

    expect(response.statusCode).toBe(415);
  });

})


describe('POST /api/v1/salesforce/process-document', () => {
  let fastify: any;
let originalServiceAccount
  beforeAll(async () => {
     originalServiceAccount = process.env.SERVICE_ACCOUNT;
    process.env.SERVICE_ACCOUNT = 'wrong value';
    console.log( process.env.SERVICE_ACCOUNT ,'process.env.SERVICE_ACCOUNT');
    fastify = await initializeApp(); // Initialize the app instance
  });;


  it('should validate the Body and process the document Return 200 status code', async () => {
    const requestBody = {
      "orgId": "00DWU00000BoiXu",
      "userName": "cddev@org.com",
      "recordId": "001WU00000Tv8bLYAR",
      "fileName": "Account",
      "contentVersionId": "068WU000005J3aPYAS",
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
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
    console.log(response.statusCode, 'Response for process document');
    expect(response.statusCode).toBe(200);

  });

  it('should validate the Body and process the document Return 400 status code', async () => {
    const requestBody = {
      "orgId": "00DWU00000BoiX",
      "userName": "cddev@org.com",
      "recordId": "001WU00000Tv8bLYAR",
      "fileName": "Account",
      "contentVersionId": "068WU0000059BivYAE",
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
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
    console.log(response, 'Response for process document');
    expect(response.statusCode).toBe(400);

  });

  it('set wrong env key ', async () => {
   
    const requestBody = {
      "orgId": "00DWU00000BoiX",
      "userName": "cddev@org.com",
      "recordId": "001WU00000Tv8bLYAR",
      "fileName": "Account",
      "contentVersionId": "068WU0000059BivYAE",
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
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
    console.log(response, 'Response for process document');
    expect(response.statusCode).toBe(400);
    process.env.SERVICE_ACCOUNT = originalServiceAccount
  });

})
