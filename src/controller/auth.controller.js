import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { generateAccessToken } from '../util/jwt.js';

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
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
      return res.status(404).json({ success: false, message: 'email and password invalid' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'email and password invalid' });
    }
    const token = generateAccessToken({ id: user.id, role: user.roleId });
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
    const { username, phone, email, password } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone }, { email }],
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
        roleId: 1,
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
