import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { truncateTables } from '../utils';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // if(connection.isInitialized) await truncateTables(connection)
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection.isInitialized) await connection.destroy();
    });

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
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();
            console.log(users);
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return the id of the created user', async () => {
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

            console.log(response.body);

            // ASSERT
            expect(response.body.id).toBe(1);
        });
    });

    describe.skip('missing given fields', () => {});
});
