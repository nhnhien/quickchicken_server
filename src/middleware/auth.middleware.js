import jwt from 'jsonwebtoken';
import { logger } from '../util/logger.js';

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Token is missing.',
      error: 'TOKEN_MISSING',
    });
  }
  try {
    const decoded = decodeToken(token);
    req.user = decoded;
    logger.info('Token decoded', decoded);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      error: 'INVALID_TOKEN',
    });
  }
};

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. No token provided.',
      error: 'TOKEN_NOT_PROVIDED',
    });
  }

  try {
    const decoded = decodeToken(token);
    req.user = decoded;
    logger.info('Token decoded for admin check', decoded);
    if (req.user.role != 2) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.',
        error: 'FORBIDDEN',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      error: 'INVALID_TOKEN',
    });
  }
};

export { verifyToken, verifyAdmin };
