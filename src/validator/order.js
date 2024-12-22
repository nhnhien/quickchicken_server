import { body } from 'express-validator';

export const createOrderValidator = [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('orderDetails')
    .isArray()
    .withMessage('Order details must be an array')
    .notEmpty()
    .withMessage('Order details cannot be empty'),
  body('totalPrice').isFloat().withMessage('Total price must be a float'),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of the following: pending, processing, shipped, delivered, cancelled'),
];
