import { initializeApp } from '../index.js';
import { API_KEY } from '../config/config.js';
import { cleanupCredentials } from '../utils/clearCrendtials.js';
describe('Initial test', () => {
    let fastify;
    beforeAll(async () => {
        fastify = await initializeApp(); // Initialize the app instance
    });
    afterAll(async () => {
        console.log('After all called');
        let data = await cleanupCredentials('/src/service/gcp/gcp-credentials.json');
        console.log(data, 'Data from cleanup');
        await fastify.close(); // Close the Fastify instance
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
});
//# sourceMappingURL=initialtest.test.js.map