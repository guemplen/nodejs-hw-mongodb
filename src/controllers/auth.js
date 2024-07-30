import createError from 'http-errors';
import { register } from '../services/auth.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await register(name, email, password);

    if (existingUser) {
      throw createError(409, 'Email in use');
    }

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
