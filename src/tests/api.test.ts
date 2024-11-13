import Fastify from 'fastify';
import { sfOrgClientIdSwagger } from '../swager/sforgidclientid.swagger.js';
import { validateRequestBody } from '../ajv/validation.js';
import { sfOrgIdClientIdValidation } from '../schema/validateSalesforceData.js';
import { sfCredentialController } from '../controller/sfcredential.controller.js';
import { processDocumentSwagger } from '../swager/processdocument.swager.js';
import { sfValidateTemplateData } from '../schema/sfuserdatavalidation.js';
import { documentController } from '../controller/document.controller.js';



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


describe('POST /api/v1/salesforce/ids', () => {
  let fastify : any;

  beforeAll(() => {
    fastify = Fastify();

    fastify.post(
      '/api/v1/salesforce/ids',
      {
        schema: sfOrgClientIdSwagger,
        preHandler: [validateRequestBody(sfOrgIdClientIdValidation)],
      },
      sfCredentialController.validateAndStoreSalesforceCredentials
    );
  });


  it('should validate the Salesforce credentials and return 200 with correct API key', async () => {
    const requestBody = {
      clientId: '3MVG9PwZx9R6_UrcKsn.dhKdoWYbj8AZY5Im_VSx5QB0C32PwXvuJiRaSOetY9cCvvHFEj7tZ2_RtwRcnaGV6',
      orgId: '00DWU00000BoiXu',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/ids',
      payload: requestBody,
      headers: {
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
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
      url: '/api/v1/salesforce/ids',
      payload: invalidRequestBody,
      headers: {
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });

    expect(response.statusCode).toBe(400);
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

  it('should validate the Body and process the document Return 401 status code', async () => {
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
