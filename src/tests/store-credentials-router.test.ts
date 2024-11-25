import { jest } from '@jest/globals';
import { API_KEY, DOCGEN_API_KEY, SF_CLIENT_ID, SF_ORG_ID } from '../config/config.js';
import { protos } from '@google-cloud/secret-manager';

// Define types for Secret Manager responses
type SecretVersionResponse = [
  {
    payload: {
      data: Buffer;
    };
  },
  protos.google.cloud.secretmanager.v1.IAccessSecretVersionResponse | undefined,
  protos.google.cloud.secretmanager.v1.IAccessSecretVersionRequest | undefined
];

type AddSecretVersionResponse = [
  {
    name: string;
    state: string;
    createTime: Date;
  },
  protos.google.cloud.secretmanager.v1.IAccessSecretVersionResponse | undefined,
  protos.google.cloud.secretmanager.v1.IAddSecretVersionRequest | undefined
];

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

// Create mock implementations
const mockAccessSecretVersion = jest.fn<() => Promise<SecretVersionResponse>>().mockResolvedValue([
  {
    payload: {
      data: Buffer.from(JSON.stringify(mockServiceAccount)),
    },
  },
  undefined,
  undefined
]);

const mockAddSecretVersion = jest.fn<() => Promise<AddSecretVersionResponse>>().mockResolvedValue([
  {
    name: 'projects/123/secrets/test-secret/versions/1',
    state: 'ENABLED',
    createTime: new Date(),
  },
  undefined,
  undefined
]);

type CreateSecretResponse = [
  {
    name: string;
  }
];

const mockCreateSecret = jest.fn<() => Promise<CreateSecretResponse>>().mockResolvedValue([
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
let initializeApp: () => Promise<any>;

describe('POST /api/v1/salesforce/store-credentials', () => {
  let fastify: any;

  beforeAll(async () => {
    // Import the app only after setting up all mocks
    const appModule = await import('../index.js');
    initializeApp = appModule.initializeApp;
    
    // Initialize Fastify app
    fastify = await initializeApp();
  });

  afterAll(async () => {
    await fastify.close();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockAccessSecretVersion.mockClear();
    mockAddSecretVersion.mockClear();
    mockCreateSecret.mockClear();
  });

  it('should validate the Salesforce credentials and return 200 with correct API key', async () => {
    // Setup
    const requestBody = {
      clientId: SF_CLIENT_ID,
      orgId: SF_ORG_ID,
    };
  
    // Execute
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/salesforce/store-credentials',
      payload: requestBody,
      headers: {
        'X-API-KEY': DOCGEN_API_KEY,
      },
    });
  
    // Debug logging
    console.log('Mock calls - accessSecretVersion:', mockAccessSecretVersion.mock.calls);
    console.log('Mock calls - addSecretVersion:', mockAddSecretVersion.mock.calls);
    console.log('Mock calls - createSecret:', mockCreateSecret.mock.calls);
    console.log('Response status:', response.statusCode);
    console.log('Response body:', response.body);
  
    // Assert
    expect(mockAddSecretVersion).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    
    // Since the response is not JSON, directly check the string
    expect(response.body).toBe("Successfully stored Client ID in Secret Manager");
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
    console.log(response, 'Response for salesfroce credentila for function 1 is ');
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

        'X-API-KEY':API_KEY,
      },
    });
    expect(response.statusCode).toBe(415);
  });

});