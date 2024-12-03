import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateAccessToken = (payload) => {
  const accessToken = sign(payload, SECRET_KEY, {
    expiresIn: '30d',
  });
  return accessToken;
};

const verifyToken = (token, secret) => {
  try {
    return verify(token, secret);
  } catch (e) {
    throw new Error('Token is invalid or expired');
  }
};

export { generateAccessToken, verifyToken };
