import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Session from '../models/session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;

    console.log('Received sessionId from cookies:', sessionId);

    if (!sessionId) {
      return next(createError(401, 'Authorization token missing or malformed'));
    }

    const session = await Session.findById(sessionId);
    if (!session || new Date() > session.accessTokenValidUntil) {
      return next(createError(401, 'Session expired or invalid'));
    }

    let decoded;
    try {
      decoded = jwt.verify(session.accessToken, JWT_SECRET);
    } catch (err) {
      console.error('Error verifying accessToken:', err.message);
      return next(createError(401, 'Invalid or expired token'));
    }

    if (!decoded || !decoded.userId) {
      return next(createError(401, 'Token payload missing userId'));
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Error in authenticate middleware:', error);
    next(error);
  }
};
