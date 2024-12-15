import express from 'express';
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProductById,
  getProducts,
} from '../controller/product.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { logger } from '../util/logger.js';
import upload from '../middleware/upload.middleware.js';
import { validateProduct } from '../validator/product.js';
import { handleValidationErrors } from '../middleware/validator.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/product-id/:id', getProductById);
router.post('/', upload.single('image'), verifyAdmin, validateProduct, handleValidationErrors, createProduct);
router.patch('/:id', upload.single('image'), verifyAdmin, validateProduct, handleValidationErrors, editProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

export default router;
