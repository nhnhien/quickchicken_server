import prisma from '../prismaClient.js';
import { logger } from '../util/logger.js';

const getDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        productDiscounts: true,
        userDiscounts: true,
      },
    });
    return res.json({
      success: true,
      data: discounts,
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return res.status(500).json({ message: 'Error fetching discounts' });
  }
};

const getDiscountById = async (req, res) => {
  const { id } = req.params;
  try {
    const discount = await prisma.discount.findUnique({
      where: { id: parseInt(id) },
      include: {
        productDiscounts: true,
        userDiscounts: true,
      },
    });
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    return res.json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    return res.status(500).json({ message: 'Error fetching discount' });
  }
};

const createDiscount = async (req, res) => {
  const { title, type, apply_to, code, value, start_date, end_date, product_ids, user_ids } = req.body;
  try {
    const discount = await prisma.discount.create({
      data: {
        title,
        type,
        apply_to,
        code,
        value,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });
    if (apply_to === 'specific_product' && product_ids && product_ids.length > 0) {
      const productDiscounts = product_ids.map((product_id) => ({
        discount_id: discount.id,
        product_id,
      }));

      await prisma.productDiscount.createMany({
        data: productDiscounts,
      });
    }
    if (apply_to === 'specific_customer' && user_ids && user_ids.length > 0) {
      const userDiscounts = user_ids.map((user_id) => ({
        discount_id: discount.id,
        user_id,
      }));

      await prisma.userDiscount.createMany({
        data: userDiscounts,
      });
    }
    if (apply_to === 'all_product') {
      const products = await prisma.product.findMany();
      const productDiscounts = products.map((product) => ({
        discount_id: discount.id,
        product_id: product.id,
      }));
      await prisma.productDiscount.createMany({
        data: productDiscounts,
      });
    }
    if (apply_to === 'all_customers') {
      const users = await prisma.user.findMany();
      const userDiscounts = users.map((user) => ({
        discount_id: discount.id,
        user_id: user.id,
      }));
      await prisma.userDiscount.createMany({
        data: userDiscounts,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Create discount successfully',
      data: discount,
    });
  } catch (error) {
    logger.error('Error creating discount:', error);
    return res.status(500).json({
      success: true,
      message: 'Error creating discount',
      error: error.message,
    });
  }
};

const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { title, type, apply_to, code, value, start_date, end_date } = req.body;
  try {
    const discount = await prisma.discount.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        apply_to,
        code,
        value,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });
    return res.json(discount);
  } catch (error) {
    console.error('Error updating discount:', error);
    return res.status(500).json({ message: 'Error updating discount' });
  }
};

const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const discount = await prisma.discount.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ message: 'Discount deleted successfully', discount });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return res.status(500).json({ message: 'Error deleting discount' });
  }
};

const applyDiscount = async (req, res) => {
  //   const { discountCode, orderId } = req.body;
  //   try {
  //     const discount = await prisma.discount.findUnique({
  //       where: { code: discountCode },
  //     });
  //     if (!discount) {
  //       return res.status(404).json({ message: 'Discount not found' });
  //     }
  //     const order = await prisma.order.update({
  //       where: { id: orderId },
  //       data: {
  //         total_price: {
  //           decrement: discount.value,
  //         },
  //       },
  //     });
  //     return res.json({ message: 'Discount applied successfully', order });
  //   } catch (error) {
  //     console.error('Error applying discount:', error);
  //     return res.status(500).json({ message: 'Error applying discount' });
  //   }
};

export { getDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount, applyDiscount };
