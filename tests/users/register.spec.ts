import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app';

describe('POST /auth/register', () => {
    describe('given all fields', () => {
        it('should return 201 status code', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret',
            };
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            expect(response.statusCode).toBe(201);
        });

        it('should return json value', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret',
            };
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            expect(response.header['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist user in database', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret',
            };
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
        });
    });

    describe.skip('missing given fields', () => {});
});
