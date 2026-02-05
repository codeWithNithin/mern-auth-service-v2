import type { Response, NextFunction } from 'express';
import type { RegisterUserRequest } from '../types/index.js';
import type UserService from '../services/UserService.js';

export default class AuthController {
    constructor(private userService: UserService) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // 1. ge the requst body from client
        const { firstName, lastName, email, password } = req.body;

        const response = await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });

        const isFalse: boolean = false;
        if (isFalse) next();

        res.status(201).json({ id: response.id });
    }
}
