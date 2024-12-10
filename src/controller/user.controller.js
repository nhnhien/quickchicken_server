import prisma from '../prismaClient.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

const getUser = async (req, res) => {
  const users = await prisma.user.findMany({});

  if (!users) {
    return res.status(404).json({
      success: false,
      message: 'No users found',
    });
  }
  return res.status(200).json({
    success: true,
    message: 'get users successfully',
    users: users,
  });
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  const { username, phone, email, password, roleId } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username, phone, or email already in use',
        error: 'USER_EXISTS',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        roleId,
      },
    });
    return res.status(201).json({
      success: true,
      message: `User ${user.username} created successfully`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.roleId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, roleId } = req.body;
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found`,
    });
  }

  try {
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username: username || user.username,
        email: email || user.email,
        phone: phone || user.phone,
        roleId: roleId || user.roleId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `User with id ${updatedUser.id} updated successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.roleId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found`,
    });
  }

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: `User with id ${id} deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

export { getUser, createUser, updateUser, deleteUser };
