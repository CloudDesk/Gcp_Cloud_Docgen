// import { API_KEY, SF_CLIENT_ID, SF_ORG_ID } from '../config/config';
// import { initializeApp } from '../index'; // Adjust the path to your file

// describe('API Key Validation Tests', () => {
//     let fastify: any;

//     beforeAll(async () => {
//         fastify = await initializeApp(); // Initialize the app instance
//     });



//     it('should return 200 for correct API key', async () => {

//         const requestBody = {
//             clientId: SF_CLIENT_ID,
//             orgId: SF_ORG_ID,
//         };
//         const response = await fastify.inject({
//             method: 'POST', // Replace with your method
//             url: '/api/v1/salesforce/store-credentials', // Replace with your endpoint
//             payload: requestBody,   
//             headers: {
//                 'x-api-key': API_KEY, // Mock the correct API key
//             },
//         });

//         expect(response.statusCode).toBe(200); // Adjust based on expected response
//     });

//     it('should return 403 for incorrect API key', async () => {
//         const response = await fastify.inject({
//             method: 'POST',
//             url: '/api/v1/salesforce/store-credentials',
//             headers: {
//                 'x-api-key': 'wrong-api-key', // Mock the incorrect API key
//             },
//         });

//         expect(response.statusCode).toBe(403); // Check for access denied
//     });

//     it('should return 401 if API key is missing', async () => {
//         const response = await fastify.inject({
//             method: 'POST',
//             url: '/api/v1/salesforce/store-credentials',
//         });

//         expect(response.statusCode).toBe(401); // Check for missing API key
//     });


//     afterAll(async () => {
//         await fastify.close(); // Close Fastify after all tests
//     });
// });
