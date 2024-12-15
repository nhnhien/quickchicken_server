import { body } from 'express-validator';

export const validateProduct = [
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
];
