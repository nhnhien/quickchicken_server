import prisma from '../prismaClient.js';
import { logger } from '../util/logger.js';

const getDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        productDiscounts: {
          include: {
            product: true,
          },
        },
        userDiscounts: {
          include: {
            user: true,
          },
        },
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
  const { title, type, discount_code, value, start_date, end_date, product_ids, user_ids } = req.body;

  try {
    if (product_ids && product_ids.length > 0) {
      const validProducts = await prisma.product.findMany({
        where: {
          id: { in: product_ids },
        },
      });

      if (validProducts.length !== product_ids.length) {
        return res.status(400).json({
          success: false,
          message: 'Some product IDs are invalid',
        });
      }
    }

    if (user_ids && user_ids.length > 0) {
      const validUsers = await prisma.user.findMany({
        where: {
          id: { in: user_ids },
        },
      });

      if (validUsers.length !== user_ids.length) {
        return res.status(400).json({
          success: false,
          message: 'Some user IDs are invalid',
        });
      }
    }

    const discount = await prisma.discount.create({
      data: {
        title,
        type,
        discount_code,
        value,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    if (product_ids && product_ids.length > 0) {
      const productDiscounts = product_ids.map((product_id) => ({
        discount_id: discount.id,
        product_id,
      }));
      await prisma.productDiscount.createMany({
        data: productDiscounts,
      });
    }

    if (user_ids && user_ids.length > 0) {
      const userDiscounts = user_ids.map((user_id) => ({
        discount_id: discount.id,
        user_id,
      }));
      await prisma.userDiscount.createMany({
        data: userDiscounts,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: discount,
    });
  } catch (error) {
    logger.error('Error creating discount:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating discount',
      error: error.message,
    });
  }
};

const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const { title, type, code, value, start_date, end_date, product_ids, user_ids } = req.body;
  try {
    const discount = await prisma.discount.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        code,
        value,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });

    if (product_ids) {
      await prisma.productDiscount.deleteMany({ where: { discount_id: discount.id } });
      const productDiscounts = product_ids.map((product_id) => ({
        discount_id: discount.id,
        product_id,
      }));
      await prisma.productDiscount.createMany({
        data: productDiscounts,
      });
    }

    if (user_ids) {
      await prisma.userDiscount.deleteMany({ where: { discount_id: discount.id } });
      const userDiscounts = user_ids.map((user_id) => ({
        discount_id: discount.id,
        user_id,
      }));
      await prisma.userDiscount.createMany({
        data: userDiscounts,
      });
    }

    return res.json({
      success: true,
      message: 'Discount updated successfully',
      data: discount,
    });
  } catch (error) {
    console.error('Error updating discount:', error);
    return res.status(500).json({ message: 'Error updating discount' });
  }
};

const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.productDiscount.deleteMany({ where: { discount_id: parseInt(id) } });
    await prisma.userDiscount.deleteMany({ where: { discount_id: parseInt(id) } });
    await prisma.discount.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return res.status(500).json({ message: 'Error deleting discount' });
  }
};

const applyDiscount = async (req, res) => {
  const { discount_code, cartItems, userId } = req.body;
  console.log('🚀 ~ applyDiscount ~  discount_code:', discount_code);

  if (!discount_code) {
    return res.status(400).json({
      success: false,
      message: 'Discount code is required',
    });
  }

  try {
    const discount = await prisma.discount.findFirst({
      where: {
        discount_code: discount_code,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
      include: {
        productDiscounts: true,
        userDiscounts: true,
      },
    });
    if (!discount) {
      return res.status(200).json({
        success: false,
        message: 'Invalid or expired discount code. Returning cart with original prices.',
        data: {
          items: cartItems,
        },
      });
    }

    const validProductDiscounts = discount.productDiscounts.filter((productDiscount) =>
      cartItems.some((item) => item.id === productDiscount.product_id)
    );
    const validUserDiscounts = discount.userDiscounts.filter((userDiscount) => userDiscount.user_id === userId);

    if (validProductDiscounts.length === 0 || validUserDiscounts.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No valid products or user for this discount. Returning cart with original prices.',
        data: {
          items: cartItems,
        },
      });
    }

    const updatedCartItems = cartItems.map((item) => {
      const validProductDiscount = validProductDiscounts.find(
        (productDiscount) => productDiscount.product_id === item.id
      );

      let discountedPrice = item.price;

      if (validProductDiscount) {
        if (discount.type === 'percent') {
          discountedPrice -= (discountedPrice * discount.value) / 100;
        } else if (discount.type === 'fixed') {
          discountedPrice -= discount.value;
        }
      }

      return {
        ...item,
        discount_code,
        discount_value: discount.value,
        discount_type: discount.type,
        discounted_price: discountedPrice,
        line_price: discountedPrice * item.quantity,
      };
    });

    const total_price = updatedCartItems.reduce((acc, item) => acc + item.line_price, 0);

    return res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      data: {
        items: updatedCartItems,
        discounted_total_price: total_price,
        discount_code,
        discount_value: discount.value,
        discount_type: discount.type,
      },
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    return res.status(500).json({
      success: false,
      message: 'Error applying discount',
      error: error.message,
    });
  }
};

export { getDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount, applyDiscount };
