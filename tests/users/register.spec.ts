import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { truncateTables } from '../utils';
import { Roles } from '../../src/constants';

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
                password: 'secret123',
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
                password: 'secret123',
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
                password: 'secret123',
            };
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

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
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            expect(response.body.id).toBe(1);
        });

        it('should assign a customer role', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };
            // ACT
            await request(app).post('/auth/register').send(userData);

            // ASSERT
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should have hashed password in response', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            // ACT
            await request(app).post('/auth/register').send(userData);

            // ASSERT
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find({ select: ['password'] });

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it('should return 400 status code if email is already present', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe('missing given fields', () => {
        it('should send 400 status if email field is missing', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: '',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if firstName is missing', async () => {
            //   ARRANGE
            const userData = {
                firstName: '',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if firstName is missing', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: '',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if password is missing', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: '',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if email is not a valid email', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if password length is less than 8 characters', async () => {
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

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return an array of error messages if email is missing', async () => {
            //   ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: '',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // ASSERT
            expect(
                Array.isArray((response.body as Record<string, string>).errors),
            ).toBe(true);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // ARRANGE
            const userData = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: ' example@gmail.com ',
                password: 'secret123',
            };

            // ACT
            await request(app).post('/auth/register').send(userData);

            // ASSERT
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].email).toBe('example@gmail.com');
        });
    });
});
