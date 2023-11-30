const { body } = require('express-validator');
const User = require('../models/user');

exports.signupValidation = [
    body('name', 'Enter a valid name')
        .trim()
        .not()
        .isEmpty()
    ,
    body("email")
        .trim()
        .isEmail()
        .withMessage('Enter a valid email')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject('E-mail address already exists');
            }
            return user;
        })
        .normalizeEmail()
    ,
    body("password", 'Enter a password with minimum length of 8, at least 1 lowerCase character, at least 1 upperCase character')
        .trim()
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")
    ,
    body("passwordConfirmation", "Passwords have to match.")
        .trim()
        .custom((value, { req }) => value === req.body.password)
    ,
];


exports.loginValidation = [
    body("email", 'Enter a valid email')
        .trim()
        .isEmail()
        .normalizeEmail()
    ,
    body("password", "Enter your password")
        .trim()
        .not()
        .isEmpty()
];

exports.resetPasswordValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid email')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (!user) {
                return Promise.reject('No user was found with this email');
            }
            return user;
        })
        .normalizeEmail()
];

exports.newPasswordValidation = [
    body("newPassword", 'Enter a password with minimum length of 8, at least 1 lowerCase character, at least 1 upperCase character')
        .trim()
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")
    ,
    body("passwordConfirmation", "Passwords have to match.")
        .trim()
        .custom((value, { req }) => value === req.body.newPassword)
    ,
]