import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRATION = '1h';
const REFRESH_EXPIRATION = '7d';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(409, 'Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      data: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw createError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: REFRESH_EXPIRATION,
    });

    const session = new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 60 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await session.save();

    res.cookie('sessionId', session._id, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (!sessionId) {
      return next(createError(401, 'Session ID is missing'));
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return next(createError(401, 'Session not found or already expired'));
    }

    await Session.deleteOne({ _id: sessionId });

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    console.error('Error in logout:', error);
    next(error);
  }
};


export const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(400, 'Refresh token is missing');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      console.error('Error verifying refreshToken:', err.message);
      throw createError(401, 'Invalid or expired refresh token');
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw createError(401, 'Invalid or expired refresh token');
    }

    const accessToken = jwt.sign({ userId: session.userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
    const newRefreshToken = jwt.sign({ userId: session.userId }, JWT_SECRET, {
      expiresIn: REFRESH_EXPIRATION,
    });

    session.accessToken = accessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + 60 * 60 * 1000);
    session.refreshTokenValidUntil = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    await session.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      status: 200,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Error in refreshTokens:', error);
    next(error);
  }
};

