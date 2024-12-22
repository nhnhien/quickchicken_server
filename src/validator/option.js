import { body, param } from 'express-validator';

export const validateOption = [
  body('name').isString().withMessage('Name must be a string'),
  body('value').isString().withMessage('Value must be a string'),
  body('additional_price').optional().isFloat({ min: 0 }).withMessage('Additional price must be a positive number'),
];
