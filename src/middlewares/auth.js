import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';

const { JWT_SECRET } = process.env;

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(createError(401, 'Authorization header is missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      throw createError(401, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    next(createError(401, 'Invalid token'));
  }
};
