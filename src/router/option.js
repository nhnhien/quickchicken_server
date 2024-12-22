import express from 'express';
import {
  getOptions,
  getOptionById,
  createOption,
  updateOption,
  deleteOption,
} from '../controller/option.controller.js';

const router = express.Router();

router.get('/:id', getOptionById);
router.get('/', getOptions);
router.post('/', createOption);
router.patch('/:id', updateOption);
router.delete('/:id', deleteOption);

export default router;
