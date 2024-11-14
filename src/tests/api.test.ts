import Fastify from 'fastify';
import { sfOrgClientIdSwagger } from '../swager/sforgidclientid.swagger.js';
import { validateRequestBody } from '../ajv/validation.js';
import { sfOrgIdClientIdValidation } from '../schema/validateSalesforceData.js';
import { sfCredentialController } from '../controller/sfcredential.controller.js';
import { processDocumentSwagger } from '../swager/processdocument.swager.js';
import { sfValidateTemplateData } from '../schema/sfuserdatavalidation.js';
import { documentController } from '../controller/document.controller.js';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY;
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_ORG_ID = process.env.SF_ORG_ID;
console.log(API_KEY  ,'process env api key');
console.log(SF_CLIENT_ID ,'process env client id');
console.log(SF_ORG_ID ,'process env org id');
describe('API Endpoints', () => {
  it('should return 200', async () => {
    const fastify = Fastify();

    fastify.get('/', async (request, reply) => {
      return { message: 'Hello, world!' };
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    await fastify.close();
  });
});


describe('POST /api/v1/salesforce/store-credentials', () => {
  let fastify : any;

  beforeAll(() => {
    fastify = Fastify();

    fastify.post(
      '/api/v1/salesforce/store-credentials',
      {
        schema: sfOrgClientIdSwagger,
        preHandler: [validateRequestBody(sfOrgIdClientIdValidation)],
      },
      sfCredentialController.validateAndStoreSalesforceCredentials
    );
  });


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
    const requestBody = JSON.stringify({
      clientId: SF_CLIENT_ID,
      orgId: SF_ORG_ID,
    });
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: requestBody,
      headers: {
        'Content-Type': 'application/json',  // Ensure Content-Type is set to application/json
        'X-API-KEY': API_KEY,
      },
    });
    console.log(response, 'Response for salesfroce credentila');
    expect(response.statusCode).toBe(200);

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

  afterAll(async () => {
    await fastify.close();
  });
})


describe('POST /api/v1/salesforce/process-document', () => {
  let fastify : any;

  beforeAll(() => {
    fastify = Fastify();

    fastify.post(
      '/api/v1/salesforce/process-document',
      {
        schema: processDocumentSwagger,
        preHandler: [validateRequestBody(sfValidateTemplateData)],
      },
      documentController.processDocument
    );
  });


  it('should validate the Body and process the document Return 200 status code', async () => {
    const requestBody = {
      "orgId": "00DWU00000BoiXu",
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
    console.log(requestBody ,'requestBody');
    const response = await fastify.inject({
      method: 'POST',
      // url: '/api/v1/salesforce/process-document',
      url: '/api/v1/salesforce/process-document',
      payload: requestBody,
      headers: {
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
    console.log(response ,'Response for process document');
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
    console.log(requestBody ,'requestBody');
    const response = await fastify.inject({
      method: 'POST',
      // url: '/api/v1/salesforce/process-document',
      url: '/api/v1/salesforce/process-document',
      payload: requestBody,
      headers: {
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
    console.log(response ,'Response for process document');
    expect(response.statusCode).toBe(400);

  });
  afterAll(async () => {
    await fastify.close();
  });
})
