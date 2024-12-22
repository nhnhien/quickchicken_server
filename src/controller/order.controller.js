import prisma from '../prismaClient.js';
import { validationResult } from 'express-validator';

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderDetails: true,
        user: true,
        payments: {
          select: {
            status: true,
          },
        },
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Fetched orders successfully',
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderDetails: true,
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order with ID ${id} fetched successfully`,
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { userId, orderDetails, totalPrice } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`,
      });
    }

    const productIds = orderDetails.map((detail) => detail.product_id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more products in the order do not exist',
      });
    }

    const order = await prisma.order.create({
      data: {
        user_id: userId,
        total_price: totalPrice,
        status: 'pending',
        orderDetails: {
          create: orderDetails.map((detail) => ({
            product_id: detail.product_id,
            quantity: detail.quantity,
            price: detail.price,
            options: detail.options || null,
          })),
        },
      },
      include: {
        orderDetails: true,
      },
    });
    const payment = await prisma.payment.create({
      data: {
        order_id: order.id,
        payment_method: 'vnpay',
        status: 'pending',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        user_id: order.user_id,
        total_price: order.total_price,
        status: order.status,
        orderDetails: order.orderDetails,
        payment_id: payment.id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status provided',
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: `Order with ID ${updatedOrder.id} updated successfully`,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total_price: updatedOrder.total_price,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: `Order with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message,
    });
  }
};

export { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder };
