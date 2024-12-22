import prisma from '../prismaClient.js';
import { logger } from '../util/logger.js';

const getOptions = async (req, res) => {
  try {
    const options = await prisma.option.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        productOptions: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    logger.error('Error fetching options: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch options',
      error: error.message,
    });
  }
};

const getOptionById = async (req, res) => {
  const { id } = req.params;
  try {
    const option = await prisma.option.findUnique({
      where: { id: parseInt(id) },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option not found',
      });
    }

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    logger.error('Error fetching option by id: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch option',
      error: error.message,
    });
  }
};

const createOption = async (req, res) => {
  const { name, value, additional_price } = req.body;

  try {
    const newOption = await prisma.option.create({
      data: {
        name,
        value,
        additional_price: additional_price || 0.0,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Option created successfully!',
      option: newOption,
    });
  } catch (error) {
    logger.error('Error creating option: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create option',
      error: error.message,
    });
  }
};

const updateOption = async (req, res) => {
  const { id } = req.params;
  const { name, value, additional_price, confirmation } = req.body;

  if (!name && !value && additional_price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (name, value, additional_price) must be provided.',
    });
  }

  try {
    const option = await prisma.option.findUnique({
      where: { id: parseInt(id) },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option not found',
      });
    }

    const linkedProducts = await prisma.productOption.findMany({
      where: { option_id: parseInt(id) },
    });

    if (linkedProducts.length > 0) {
      if (!confirmation || confirmation !== 'CONFIRM_UPDATE') {
        return res.status(400).json({
          success: false,
          message:
            'This option is linked to products. Please confirm the update by sending confirmation: CONFIRM_UPDATE.',
        });
      }
    }

    const updatedOption = await prisma.option.update({
      where: { id: parseInt(id) },
      data: {
        name: name || option.name,
        value: value || option.value,
        additional_price: additional_price !== undefined ? additional_price : option.additional_price,
      },
    });
    res.status(200).json({
      success: true,
      message: 'Option updated successfully!',
      option: updatedOption,
    });
  } catch (error) {
    logger.error('Error updating option: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update option',
      error: error.message,
    });
  }
};

const deleteOption = async (req, res) => {
  const { id } = req.params;
  try {
    const option = await prisma.option.findUnique({
      where: { id: parseInt(id) },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option not found',
      });
    }

    const linkedProducts = await prisma.productOption.findMany({
      where: { option_id: parseInt(id) },
    });

    if (linkedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Option is being used by one or more products, delete operation cannot be performed.',
      });
    }

    await prisma.option.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Option deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting option: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete option',
      error: error.message,
    });
  }
};

export { getOptions, getOptionById, createOption, updateOption, deleteOption };
