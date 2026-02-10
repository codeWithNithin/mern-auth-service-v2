import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        notEmpty: true,
        errorMessage: 'email is required',
        trim: true,
        isEmail: {
            errorMessage: 'Email should a valid one',
        },
    },
    password: {
        notEmpty: true,
        errorMessage: 'password is required',
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
});
