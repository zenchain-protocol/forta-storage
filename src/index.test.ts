import request from 'supertest';
import 'ioredis-mock';
import { app } from '.'; // Adjust path as necessary

jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

describe('API tests', () => {
    describe('GET /value', () => {
        it('should return 400 if no key is provided', async () => {
            const response = await request(app).get('/value');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid key');
        });

        it('should return 404 if key is not found', async () => {
            const response = await request(app).get('/value').query({ key: 'NON_EXISTENT_KEY' });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not found');
        });

        it('should return the value for a valid key', async () => {
            process.env.SECRET_TEST_KEY = 'test_value';
            const response = await request(app).get('/value').query({ key: 'TEST_KEY' });
            expect(response.status).toBe(200);
            expect(response.body.data).toBe('test_value');
        });
    });

    describe('GET /store', () => {
        it('should return 400 if no key is provided', async () => {
            const response = await request(app).get('/store');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid key');
        });

        it('should return 404 if key is not found', async () => {
            const response = await request(app).get('/store').query({ key: 'NON_EXISTENT_KEY' });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not found');
        });
    });

    describe('POST /store', () => {
        it('should return 400 if no key or value is provided', async () => {
            const response = await request(app).post('/store').send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid key');
        });

        it('should return 400 if value is not a JSON object', async () => {
            const response = await request(app).post('/store').send({ key: 'test_key', value: 'string_value' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Value must be a JSON object');
        });

        it('should return 400 if value exceeds size limit', async () => {
            const largeValue = 'x'.repeat(1024 * 100 + 1); // >100kb string
            const response = await request(app).post('/store').send({ key: 'test_key', value: largeValue });
            expect(response.status).toBe(413);
        });

        it('should successfully store and retrieve the value', async () => {
            const testValue = { foo: 'bar' };
            let response = await request(app).post('/store').send({ key: 'test_key', value: testValue });
            expect(response.status).toBe(200);
            expect(response.body.data).toBe('Key test_key updated successfully');
            response = await request(app).get('/store').query({ key: 'test_key' });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(testValue);
        });
    });
});
