import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';
import jwt from 'jsonwebtoken';

const { JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION } =
  process.env;

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, 'Email is already in use');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      status: 201,
      message: 'User successfully registered',
      data: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRATION,
    });

    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRATION,
    });

    const session = new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(
        Date.now() + JWT_ACCESS_EXPIRATION * 1000,
      ),
      refreshTokenValidUntil: new Date(
        Date.now() + JWT_REFRESH_EXPIRATION * 1000,
      ),
    });

    await session.save();

    res.status(200).json({
      status: 200,
      message: 'User successfully logged in',
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  const { accessToken } = req.body;

  try {
    await Session.findOneAndDelete({ accessToken });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    const session = await Session.findOne({ refreshToken });
    if (!session || session.refreshTokenValidUntil < new Date()) {
      throw createError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(session.userId);
    if (!user) {
      throw createError(401, 'Invalid user');
    }

    const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRATION,
    });

    session.accessToken = newAccessToken;
    session.accessTokenValidUntil = new Date(
      Date.now() + JWT_ACCESS_EXPIRATION * 1000,
    );

    await session.save();

    res.status(200).json({
      status: 200,
      message: 'Token successfully refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
};
