import express from 'express';

import {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus,
  getOrderById,
} from '../controller/order.controller.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validator/order.js';

const router = express.Router();
router.get('/:id', getOrderById);
router.get('/', getOrders);
router.post('/', createOrderValidator, createOrder);
router.put('/:id/status', updateOrderStatusValidator, updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
