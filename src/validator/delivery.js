import { body } from 'express-validator';

export const validateDelivery = [
  body('status')
    .optional()
    .isIn(['preparing', 'delivering', 'delivered', 'cancelled'])
    .withMessage('Invalid delivery status'),

  body('address').optional().isLength({ max: 255 }).withMessage('Address must be less than 255 characters'),

  body('delivery_time').optional().isISO8601().withMessage('Delivery time must be a valid date (ISO format)'),
];
