import express from 'express';
import { registerUser } from '../controllers/auth.js';
import { ctrlWrapper } from '../middlewares/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

const router = express.Router();

const userSchema = {
  name: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 3, max: 20 },
    },
    notEmpty: true,
  },
  email: {
    in: ['body'],
    isEmail: true,
    notEmpty: true,
  },
  password: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 6, max: 20 },
    },
    notEmpty: true,
  },
};

router.post('/register', validateBody(userSchema), ctrlWrapper(registerUser));

export default router;
