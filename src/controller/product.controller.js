import prisma from '../prismaClient.js';
import { logger } from '../util/logger.js';
import { deleteFile, uploadFile } from '../services/upload.service.js';

const getProducts = async (req, res) => {
  const { page, limit, search, category_id } = req.query;
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
        productOptions: {
          include: {
            option: {
              select: {
                name: true,
                value: true,
                additional_price: true,
              },
            },
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
      include: {
        productOptions: {
          include: {
            option: true,
          },
        },
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

  const options = JSON.parse(req.body.options || '[]');

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
        productOptions: {
          create: options?.map((option) => ({
            option: {
              connectOrCreate: {
                where: {
                  name_value_additional_price: {
                    name: option.name,
                    value: option.value,
                    additional_price: option.additional_price || 0,
                  },
                },
                create: {
                  name: option.name,
                  value: option.value,
                  additional_price: option.additional_price || 0,
                },
              },
            },
          })),
        },
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

  const options = JSON.parse(req.body.options || '[]');

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { productOptions: { include: { option: true } } },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product does not exist.',
      });
    }

    const updateData = {
      name: name || product.name,
      price: price ? parseFloat(price) : product.price,
      description: description || product.description,
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
          message: 'Uploading image to Cloudinary failed.',
        });
      }
      updateData.image = imageUrl;
    }

    if (options.length > 0) {
      const existingOptions = product.productOptions.map((po) => po.option);

      const currentOptionIds = [];

      for (const newOption of options) {
        const existingOption = existingOptions.find(
          (opt) => opt.name === newOption.name && opt.value === newOption.value
        );

        if (existingOption) {
          // Nếu `additional_price` thay đổi -> cập nhật
          if (existingOption.additional_price !== newOption.additional_price) {
            await prisma.option.update({
              where: { id: existingOption.id },
              data: { additional_price: newOption.additional_price },
            });
          }
          currentOptionIds.push(existingOption.id);
        } else {
          const newOpt = await prisma.option.create({
            data: {
              name: newOption.name,
              value: newOption.value,
              additional_price: newOption.additional_price || 0,
            },
          });

          await prisma.productOption.create({
            data: {
              product_id: product.id,
              option_id: newOpt.id,
            },
          });

          currentOptionIds.push(newOpt.id);
        }
      }

      await prisma.productOption.deleteMany({
        where: {
          product_id: product.id,
          NOT: {
            option_id: {
              in: currentOptionIds,
            },
          },
        },
      });
    }

    // Cập nhật sản phẩm
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    logger.error('Error when updating product: ', error.message);
    res.status(500).json({
      success: false,
      message: 'Cannot update product.',
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        productOptions: {
          include: {
            option: true,
          },
        },
      },
    });
    console.log("🚀 ~ deleteProduct ~ existingProduct :", existingProduct )
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product does not exist.',
      });
    }
    const oldImagePublicId = `lotteria/${existingProduct.image.split('/').pop().split('.')[0]}`;
    await deleteFile(oldImagePublicId);

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: `Product with ID ${id} has been successfully deleted.`,
    });
  } catch (error) {
    logger.error('Error deleting product: ', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the product.',
      error: error.message,
    });
  }
};

export { getProducts, createProduct, deleteProduct, editProduct, getProductById };
