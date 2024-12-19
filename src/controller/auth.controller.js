import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { generateAccessToken } from '../util/jwt.js';
import { logger } from '../util/logger.js';

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email or password are required' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'email hoặc password không đúng' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'email hoặc password không đúng' });
    }
    const token = generateAccessToken({ id: user.id, role: user.role_id, name: user.username });
    res.status(200).json({
      message: 'Sign in successful',
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

const signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    logger.info('req', req);
    const { phone, username, email, password } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { phone: phone }, { email: email }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username, phone, or email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        phone,
        email,
        password: hashedPassword,
        role_id: 1,
      },
      include: {
        role: true,
      },
    });
    res.status(201).json({
      message: 'User successfully created',
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later.' });
  }
};

export { signIn, signUp };
