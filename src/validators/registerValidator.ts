import { checkSchema } from 'express-validator';

// 1 way to do
// export default [
//     body('email')
//         .notEmpty()
//         .withMessage('email is required')
//         .isEmail()
//         .withMessage('invalid email format'),
// ];

// 2nd way

export default checkSchema({
    firstName: {
        notEmpty: true,
        trim: true,
        errorMessage: 'First Name is required',
    },
    lastName: {
        notEmpty: true,
        trim: true,
        errorMessage: 'Last Name is required',
    },
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
