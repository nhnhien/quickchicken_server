import prisma from '../prismaClient.js';
import { validationResult } from 'express-validator';

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            username: true,
            phone: true,
            email: true,
          },
        },
        payments: {
          select: {
            status: true,
          },
        },
        deliveries: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Fetched orders successfully',
      orders,
    });
  } catch (error) {
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
        orderDetails: {
          include: {
            product: true,
          },
        },
        user: true,
        payments: {
          select: {
            status: true,
          },
        },
        deliveries: {
          select: {
            id: true,
            status: true,
          },
        },
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
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`,
      });
    }

    const orders = await prisma.order.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            username: true,
            phone: true,
            email: true,
          },
        },
        payments: {
          select: {
            status: true,
          },
        },
        deliveries: {
          select: {
            id: true,
            address: true,
            status: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No orders found for user with ID ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  const { userId, orderDetails, totalPrice, paymentMethod, note, shippingAddress } = req.body;

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

    const result = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          user_id: userId,
          total_price: totalPrice,
          status: 'pending',
          note,
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
          payment_method: paymentMethod,
          amount: totalPrice,
        },
      });

      const delivery = await prisma.delivery.create({
        data: {
          order_id: order.id,
          address: shippingAddress,
          status: 'pending',
        },
      });

      return { order, payment, delivery };
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: result.order.id,
        user_id: result.order.user_id,
        total_price: result.order.total_price,
        status: result.order.status,
        order_detail: result.order.orderDetails,
        order_note: result.order.note,
        payment_method: result.payment.payment_method,
        payment_id: result.payment.id,
        delivery_status: result.delivery.status,
        delivery_id: result.delivery.id,
      },
    });
  } catch (error) {
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
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

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
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message,
    });
  }
};

export { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, getOrdersByUser };
