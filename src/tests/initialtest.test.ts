import { initializeApp } from '../index.js';
import { API_KEY } from '../config/config.js';
import { cleanupCredentials } from '../utils/clearCrendtials.js';

describe('Initial test', () => {
    let fastify: any;
console.log('test')
console.log('test')
console.log('test')
    beforeAll(async () => {
        fastify = await initializeApp(); // Initialize the app instance

    });

    afterAll(async () => {
        console.log('After all called')
        let data = await cleanupCredentials('/src/service/gcp/gcp-credentials.json')
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

})