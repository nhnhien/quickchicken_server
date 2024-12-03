import { body } from 'express-validator';

export const signUpValidator = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('phone').isMobilePhone().withMessage('Phone number must be valid'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];
