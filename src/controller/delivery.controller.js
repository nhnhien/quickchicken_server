import prisma from '../prismaClient.js';

const getDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: true, // Liên kết với bảng Order để lấy thông tin đơn hàng
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Fetched deliveries successfully',
      deliveries,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message,
    });
  }
};

const getDeliveryById = async (req, res) => {
  const { id } = req.params;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: true, // Liên kết với bảng Order để lấy thông tin đơn hàng
      },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: `Delivery with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Delivery with ID ${id} fetched successfully`,
      delivery,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery',
      error: error.message,
    });
  }
};

const createDelivery = async (req, res) => {
  const { orderId, address, status, deliveryTime } = req.body;

  try {
    // Tạo một delivery mới
    const delivery = await prisma.delivery.create({
      data: {
        order_id: orderId,
        address: address,
        status: status,
        delivery_time: deliveryTime || null, // Nếu không có thì sẽ là null
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      delivery,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create delivery',
      error: error.message,
    });
  }
};

const updateDelivery = async (req, res) => {
  const { id } = req.params;
  const { address, status, deliveryTime } = req.body;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: `Delivery with ID ${id} not found`,
      });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: parseInt(id) },
      data: {
        address: address || delivery.address,
        status: status || delivery.status,
        delivery_time: deliveryTime || delivery.delivery_time,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery updated successfully',
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update delivery',
      error: error.message,
    });
  }
};

const deleteDelivery = async (req, res) => {
  const { id } = req.params;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: `Delivery with ID ${id} not found`,
      });
    }

    await prisma.delivery.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete delivery',
      error: error.message,
    });
  }
};

export { getDeliveries, getDeliveryById, createDelivery, updateDelivery, deleteDelivery };
