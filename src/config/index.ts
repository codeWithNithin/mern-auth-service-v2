import { config } from 'dotenv';

config({ path: `./.env.${process.env.NODE_ENV || 'dev'}` });

// const {
//     NODE_ENV,
//     PORT,
//     DB_HOST,
//     DB_PORT,
//     DB_USERNAME,
//     DB_PASSWORD,
//     DB_NAME,
//     REFRESH_TOKEN_SECRET,
//     JWKS_URI,
//     PRIVATE_KEY,
//     DB_SSL,
//     ADMIN_UI,
// } = process.env

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export const Config = {
    PORT: requiredEnv('PORT'),
    NODE_ENV: requiredEnv('NODE_ENV'),
    DB_HOST: requiredEnv('DB_HOST'),
    DB_PORT: requiredEnv('DB_PORT'),
    DB_USERNAME: requiredEnv('DB_USERNAME'),
    DB_PASSWORD: requiredEnv('DB_PASSWORD'),
    DB_NAME: requiredEnv('DB_NAME'),
    REFRESH_TOKEN_SECRET: requiredEnv('REFRESH_TOKEN_SECRET'),
    // JWKS_URI: requiredEnv('JWKS_URI'),
    // DB_SSL: requiredEnv('DB_SSL'),
    // ADMIN_UI: requiredEnv('ADMIN_UI')
};
