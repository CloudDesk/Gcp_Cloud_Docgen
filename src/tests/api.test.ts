import Fastify from 'fastify';
import { API_KEY, SF_CLIENT_ID, SF_ORG_ID } from '../config/config.js';
import { sfOrgClientIdSwagger } from '../swager/sforgidclientid.swagger.js';
import { validateRequestBody } from '../ajv/validation.js';
import { sfOrgIdClientIdValidation } from '../schema/validateSalesforceData.js';
import { sfCredentialController } from '../controller/sfcredential.controller.js';

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
  let fastify;

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
      clientId:'3MVG9PwZx9R6_UrcKsn.dhKdoWYbj8AZY5Im_VSx5QB0C32PwXvuJiRaSOetY9cCvvHFEj7tZ2_RtwRcnaGV6',
      orgId:'00DWU00000BoiXu',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/ids',
      payload: requestBody,
      headers: {
        'X-API-KEY': 'AIzaSyArxb3xZ5lTVpGrF6YbMsCrS9e8iPGLldY',
      },
    });
console.log(response ,'Response for salesfroce credentila');
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
        'X-API-KEY': API_KEY,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    await fastify.close();
  });
})
