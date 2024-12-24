import express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/auth.middleware.js';
import {
  applyDiscount,
  createDiscount,
  deleteDiscount,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from '../controller/discount.controller.js';
import discountValidator from '../validator/discount.js';
import { handleValidationErrors } from '../middleware/validator.middleware.js';

const router = express.Router();

router.get('/', getDiscounts);
router.get('/discount-id/:id', getDiscountById);
router.post('/', verifyAdmin, discountValidator, handleValidationErrors, createDiscount);
router.patch('/:id', verifyAdmin, updateDiscount);
router.delete('/:id', verifyAdmin, deleteDiscount);
router.post('/apply', verifyToken, applyDiscount);

export default router;
