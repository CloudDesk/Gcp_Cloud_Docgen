import { initializeApp } from '../index.js';
import { API_KEY, SF_CLIENT_ID, SF_ORG_ID, SF_ORG_ID_TWO } from '../config/config.js';
import { cleanupCredentials } from '..//utils/clearCrendtials.js';

describe('POST /api/v1/salesforce/store-credentials', () => {
  let fastify: any;
  beforeAll(async () => {
    fastify = await initializeApp(); // Initialize the app instance
  });;

  afterAll(async () => {
    console.log('After all called')
    let data = await cleanupCredentials('/src/service/gcp/gcp-credentials.json')
    console.log(data, 'Data from cleanup');
    await fastify.close(); // Close the Fastify instance
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




