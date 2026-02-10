import type { Response, NextFunction } from 'express';
import type { LoginUserRequest, RegisterUserRequest } from '../types/index.js';
import type UserService from '../services/UserService.js';
import { type Logger } from 'winston';
import { Roles } from '../constants/index.js';
import { validationResult } from 'express-validator';
import type { TokenService } from '../services/TokenService.js';
import type { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import type CredentialService from '../services/CredentialService.js';
import type { User } from '../entity/User.js';

export default class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // 1. ge the requst body from client
        const { firstName, lastName, email, password } = req.body;

        const error = validationResult(req);

        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() });
            return;
        }

        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: ',,,,,',
        });

        try {
            const response = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });

            this.logger.info('User created successfully', {
                userId: response.id,
            });

            const payload: JwtPayload = {
                id: response.id,
                role: response.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(response);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                httpOnly: true, // very important
                sameSite: 'strict',
                domain: 'localhost',
                maxAge: 1000 * 60 * 60, // 1 hour
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, // very imp
                sameSite: 'strict',
                domain: 'localhost',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            });

            res.status(201).json({ id: response.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        // 1. validate the incoming request body
        const error = validationResult(req);

        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() });
            return;
        }

        // 2. ge the requst body from client
        const { email, password } = req.body;

        this.logger.debug('New request to login a user', {
            email,
            password: ',,,,,',
        });

        // 2. if both are valid then check the user with the email id.
        const user = await this.userService.findByEmail(String(email));

        // 3. if user not present, then send a err msg saying user not found.
        if (!user) {
            const err = createHttpError(401, 'Invalid credential');
            next(err);
        }

        // 4. verify password with hashed password
        const passwordMatched = await this.credentialService.verifyPassword(
            String(password),
            String(user?.password),
        );

        if (!passwordMatched) {
            const err = createHttpError(401, 'Invalid credential');
            next(err);
        }

        // 5. if user is present, then generate access and refresh token.
        const payload: JwtPayload = {
            id: String(user?.id),
            role: user?.role,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
        };

        const accessToken = this.tokenService.generateAccessToken(payload);

        const newRefreshToken = await this.tokenService.persistRefreshToken(
            user as User,
        );

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
        });

        // 6. send the tokens in cookiess
        res.cookie('accessToken', accessToken, {
            httpOnly: true, // very important
            sameSite: 'strict',
            domain: 'localhost',
            maxAge: 1000 * 60 * 60, // 1 hour
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // very imp
            sameSite: 'strict',
            domain: 'localhost',
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        this.logger.info('User has been logged in', { id: user?.id });
        res.status(200).json({ id: user?.id });
    }
}
