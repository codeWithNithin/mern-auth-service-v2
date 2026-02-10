import createHttpError from 'http-errors';
import type { UserData } from '../types/index.js';
import type { User } from '../entity/User.js';
import type { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

export default class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const salt = 10;

        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. find if user already exists
        const user = await this.userRepository.findOne({
            where: {
                email: email,
            },
        });

        if (user) {
            const err = createHttpError(
                400,
                'user with same email id already exists!!',
            );
            throw err;
        }

        //2. if user doesnt exist, then create a new user

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });
        } catch {
            const err = createHttpError(
                500,
                'failed to store the data in database',
            );
            throw err;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'password',
                'role',
            ],
        });
    }
}
