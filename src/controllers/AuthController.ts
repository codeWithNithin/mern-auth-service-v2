import type { Response, NextFunction } from 'express';
import type { RegisterUserRequest } from '../types/index.js';
import type UserService from '../services/UserService.js';
import { type Logger } from 'winston';
import { Roles } from '../constants/index.js';
import { validationResult } from 'express-validator';
import type { RefreshToken } from '../entity/RefreshToken.js';
import type { Repository } from 'typeorm';
import type { TokenService } from '../services/TokenService.js';
import type { JwtPayload } from 'jsonwebtoken';

export default class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private refreshTokenRepo: Repository<RefreshToken>,
        private tokenService: TokenService,
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
}
