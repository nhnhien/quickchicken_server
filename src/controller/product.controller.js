import { validationResult } from 'express-validator';
import prisma from '../prismaClient.js';
import { logger } from '../util/logger.js';
import { deleteFile, uploadFile } from '../services/upload.service.js';

const getProducts = async (req, res) => {
  const { page, limit, search, category_id } = req.query;
  logger.info('query', req.query);
  try {
    const where = {};
    if (search) {
      where.OR = [
        {
          name: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }
    if (category_id) {
      where.category_id = parseInt(category_id);
    }
    const offset = page > 1 ? (page - 1) * limit : 0;
    const take = limit ? parseInt(limit) : undefined;
    const products = await prisma.product.findMany({
      where,
      skip: offset,
      take: take,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    if (limit) {
      const totalProducts = await prisma.product.count({ where });
      res.status(200).json({
        success: true,
        data: products,
        meta: {
          total: totalProducts,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalProducts / limit),
        },
      });
    } else {
      res.status(200).json({
        success: true,
        data: products,
      });
    }
  } catch (error) {
    logger.error('Error fetching products: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findFirstOrThrow({
      where: {
        id: parseInt(id),
      },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  const { name, price, description, stock, category_id } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
    }
    const imageUrl = await uploadFile(req.file);
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image.',
      });
    }
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        stock: parseInt(stock),
        category_id: parseInt(category_id),
        image: imageUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct,
    });
  } catch (error) {
    logger.error('Error creating product: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, stock, category_id } = req.body;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại',
      });
    }
    const updateData = {
      name: name || product.name,
      price: price ? parseFloat(price) : product.price,
      description,
      stock: stock ? parseInt(stock) : product.stock,
      category_id: category_id ? parseInt(category_id) : product.category_id,
    };

    if (req.file) {
      if (product.image) {
        const oldImagePublicId = `lotteria/${product.image.split('/').pop().split('.')[0]}`;
        await deleteFile(oldImagePublicId);
      }
      const imageUrl = await uploadFile(req.file);
      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: 'Tải ảnh lên Cloudinary thất bại.',
        });
      }
      updateData.image = imageUrl;
    }
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      product: updatedProduct,
    });
  } catch (error) {
    logger.error('Lỗi khi cập nhật sản phẩm: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật sản phẩm',
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại',
      });
    }
    const oldImagePublicId = `lotteria/${existingProduct.image.split('/').pop().split('.')[0]}`;
    await deleteFile(oldImagePublicId);
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: `Sản phẩm với ID ${id} đã được xóa thành công`,
    });
  } catch (error) {
    logger.error('Error deleting product: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa sản phẩm',
      error: error.message,
    });
  }
};

export { getProducts, createProduct, deleteProduct, editProduct, getProductById };
