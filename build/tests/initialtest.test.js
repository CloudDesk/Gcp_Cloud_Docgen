import { initializeApp } from '../index.js';
import { API_KEY } from '../config/config.js';
describe('Initial test', () => {
    let fastify;
    console.log('test 1');
    beforeAll(async () => {
        fastify = await initializeApp(); // Initialize the app instance
    });
    afterAll(async () => {
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
});
//# sourceMappingURL=initialtest.test.js.map