import type { Response, NextFunction } from 'express';
import type { RegisterUserRequest } from '../types/index.js';
import type UserService from '../services/UserService.js';
import type { Logger } from 'winston';
import { Roles } from '../constants/index.js';
import { validationResult } from 'express-validator';

export default class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
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

            res.status(201).json({ id: response.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
