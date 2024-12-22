import express from 'express';

import {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus,
  getOrderById,
  getOrdersByUser,
} from '../controller/order.controller.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validator/order.js';

const router = express.Router();
router.get('/:id', getOrderById);
router.get('/', getOrders);
router.post('/', createOrderValidator, createOrder);
router.put('/:id/status', updateOrderStatusValidator, updateOrderStatus);
router.delete('/:id', deleteOrder);
router.get('/user/:userId', getOrdersByUser);

export default router;
