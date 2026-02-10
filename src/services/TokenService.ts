import createHttpError from 'http-errors';
import fs from 'fs';
import path from 'path';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Repository } from 'typeorm';
import type { RefreshToken } from '../entity/RefreshToken.js';
import type { User } from '../entity/User.js';
import { Config } from '../config/index.js';

export class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.resolve(process.cwd(), 'certs/private.pem'),
            );
        } catch {
            const error = createHttpError(
                500,
                'Error while reading private key',
            );
            throw error;
        }

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });

        return refreshToken;
    }

    async persistRefreshToken(response: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newRefreshToken = await this.refreshTokenRepo.save({
            user: response,
            expireAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }
}
