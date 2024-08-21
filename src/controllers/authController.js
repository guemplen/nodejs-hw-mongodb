import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';
import nodemailer from 'nodemailer';

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
    console.error('Error in register:', error);
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

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
    });

    res.status(200).json({
      status: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await Session.deleteMany({ userId });

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

    const session = await Session.findOne({ refreshToken });
    if (!session || new Date() > session.refreshTokenValidUntil) {
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
      secure: process.env.NODE_ENV !== 'development',
    });

    res.status(200).json({
      status: 200,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Error in refreshTokens:', error);
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw createError(404, 'User not found!');
    }

    const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: '5m',
    });

    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`;

    const transporterConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // console.log('SMTP Configuration:');
    // console.log('Host:', transporterConfig.host);
    // console.log('Port:', transporterConfig.port);
    // console.log('User:', transporterConfig.auth.user);
    // console.log('Pass:', transporterConfig.auth.pass);

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>To reset your password, please click the link below:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    if (error.status === 404) {
      next(error);
    } else {
      console.error('Error sending email:', error);
      next(
        createError(
          500,
          `Failed to send the email, please try again later. Error: ${error.message}`,
        ),
      );
    }
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw createError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    next(error);
  }
};
