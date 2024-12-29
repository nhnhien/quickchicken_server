import express from 'express';
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
} from '../controller/delivery.controller.js';
import { validateDelivery } from '../validator/delivery.js';

const router = express.Router();

router.get('/:id', getDeliveryById);
router.get('/', getDeliveries);
router.post('/', validateDelivery, createDelivery);
router.patch('/:id', validateDelivery, updateDelivery);
router.delete('/:id', deleteDelivery);

export default router;
