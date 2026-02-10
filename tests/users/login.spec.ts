import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { isJwt } from '../utils';
import { Roles } from '../../src/constants';
import bcrypt from 'bcryptjs';

describe('POST /auth/login', () => {
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
        it('should return 401 if the user doesnt exist', async () => {
            //   ARRANGE
            const loginReq = {
                email: 'example@gmail.com',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(loginReq);

            //  ASSERT
            expect(response.statusCode).toBe(401);
        });

        it('should return 401 if password doesnt match', async () => {
            //   ARRANGE
            const userData = {
                email: 'example@gmail.com',
                password: 'secret999',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            expect(response.statusCode).toBe(401);
        });

        it('should send 200 status code', async () => {
            //   ARRANGE
            const registerReq = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            const hashedPassword = await bcrypt.hash(registerReq.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...registerReq,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: registerReq.email,
                password: registerReq.password,
            });

            // ASSERT
            expect(response.statusCode).toBe(200);
        });

        it('should have accessToken and refreshToken in cookie and must be valid', async () => {
            //   ARRANGE
            const registerReq = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            const hashedPassword = await bcrypt.hash(registerReq.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...registerReq,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: registerReq.email,
                password: registerReq.password,
            });

            interface Headers {
                ['set-cookie']: string[];
            }

            let accessToken = '',
                refreshToken = '';

            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });

    describe('fields are missing', () => {
        it('should send 400 status if email field is missing', async () => {
            // ARRANGE
            const userData = {
                email: '',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('Should return 400 status code if email is not a valid email', async () => {
            // ARRANGE
            const userData = {
                email: 'example',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return 400 status code if password length is less than 8 characters', async () => {
            // ARRANGE
            const userData = {
                email: 'example@gmail.com',
                password: 'secret',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            // ASSERT

            const userRepo = connection.getRepository(User);
            const users = await userRepo.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('Should return an array of error messages if email is missing', async () => {
            // ARRANGE
            const userData = {
                email: '',
                password: 'secret123',
            };

            // ACT
            const response = await request(app)
                .post('/auth/login')
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
            //   ARRANGE
            const registerReq = {
                firstName: 'nithin',
                lastName: 'Kumar',
                email: 'example@gmail.com',
                password: 'secret123',
            };

            const hashedPassword = await bcrypt.hash(registerReq.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...registerReq, role: Roles.CUSTOMER });

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: '  exmple@gmail.com ',
                password: registerReq.password,
            });

            // ASSERT
            const users = await userRepository.find();
            expect(users[0].email).toBe('example@gmail.com');
        });
    });
});
