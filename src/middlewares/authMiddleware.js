import createError from 'http-errors';
import Session from '../models/session.js';

export const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return next(
        createError(401, 'Authorization session ID missing or malformed'),
      );
    }

    const session = await Session.findById(sessionId);
    if (!session || new Date() > session.accessTokenValidUntil) {
      return next(createError(401, 'Session expired or invalid'));
    }

    req.user = { userId: session.userId };
    next();
  } catch (error) {
    console.error('Error in authenticate middleware:', error);
    next(error);
  }
};
