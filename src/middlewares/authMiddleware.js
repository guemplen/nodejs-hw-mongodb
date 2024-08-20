import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Session from '../models/session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'Authorization header missing or malformed'));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(createError(401, 'Invalid or expired token'));
    }

    const session = await Session.findOne({ accessToken: token });
    if (!session || new Date() > session.accessTokenValidUntil) {
      return next(createError(401, 'Session expired or invalid'));
    }

    if (!decoded || !decoded.userId) {
      return next(createError(401, 'Token payload missing userId'));
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    next(error);
  }
};
