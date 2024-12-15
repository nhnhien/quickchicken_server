import express from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../controller/category.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/category-id/:id', getCategoryById);
router.post('/', verifyAdmin, createCategory);
router.patch('/:id', verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

export default router;
