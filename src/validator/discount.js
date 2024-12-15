import { body } from 'express-validator';

const discountValidator = [
  body('title').isString().withMessage('Title must be a string.').notEmpty().withMessage('Title cannot be empty.'),

  body('type').isIn(['percent', 'fixed']).withMessage("Type must be 'percent' or 'fixed'."),

  body('code')
    .isString()
    .withMessage('Code must be a string.')
    .notEmpty()
    .withMessage('Code cannot be empty.')
    .isLength({ max: 50 })
    .withMessage('Code cannot be longer than 50 characters.'),

  body('value').isFloat({ gt: 0 }).withMessage('Value must be a number greater than 0.'),

  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date.')
    .custom((value, { req }) => {
      const startDate = new Date(value).getTime();
      const endDate = new Date(req.body.end_date).getTime();
      if (endDate && startDate > endDate) {
        throw new Error('Start date must be less than or equal to end date.');
      }
      return true;
    }),

  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date.')
    .custom((value, { req }) => {
      const endDate = new Date(value).getTime();
      const startDate = new Date(req.body.start_date).getTime();
      if (startDate && endDate < startDate) {
        throw new Error('End date must be greater than or equal to start date.');
      }
      return true;
    }),

  body('apply_to')
    .optional()
    .isString()
    .withMessage('Apply to must be a string.')
    .isIn(['specific_customer', 'specific_product', 'all_customers', 'all_product'])
    .withMessage("Apply to can only be 'specific_customer', 'specific_product', 'all_customers', or 'all_product'."),
];

export default discountValidator;
