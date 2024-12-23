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
  const { discountCode, productIds } = req.body;

  try {
    const discount = await prisma.discount.findFirst({
      where: {
        code: discountCode,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
      include: {
        productDiscounts: true,
      },
    });

    if (!discount) {
      return res.status(400).json({ message: 'Invalid or expired discount code' });
    }
    const validProductDiscounts = discount.productDiscounts.filter((productDiscount) =>
      productIds.includes(productDiscount.product_id)
    );

    if (validProductDiscounts.length === 0) {
      return res.status(400).json({ message: 'No valid products for this discount' });
    }

    const discountedProducts = await Promise.all(
      validProductDiscounts.map(async (productDiscount) => {
        const productDetails = await prisma.product.findUnique({
          where: { id: productDiscount.product_id },
        });

        if (!productDetails) {
          throw new Error(`Product with ID ${productDiscount.product_id} not found`);
        }

        let finalPrice = productDetails.price;
        if (discount.type === 'percent') {
          finalPrice -= (finalPrice * discount.value) / 100;
        } else if (discount.type === 'fixed') {
          finalPrice -= discount.value;
        }
        return {
          product_id: productDiscount.product_id,
          original_price: productDetails.price,
          discounted_price: finalPrice,
          total_price: finalPrice,
        };
      })
    );

    return res.status(200).json({
      message: 'Discount applied successfully',
      discountedProducts,
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    return res.status(500).json({ message: 'Error applying discount' });
  }
};

export { getDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount, applyDiscount };
