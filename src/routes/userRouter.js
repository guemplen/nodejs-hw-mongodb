import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from '../controllers/userController.js';
import { ctrlWrapper } from '../middlewares/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

const userSchema = {
  name: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 3, max: 20 },
    },
  },
  email: {
    in: ['body'],
    isEmail: true,
  },
  password: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 6, max: 20 },
    },
  },
};

router.post('/register', validateBody(userSchema), ctrlWrapper(registerUser));
router.post('/login', validateBody(userSchema), ctrlWrapper(loginUser));
router.post('/logout', auth, ctrlWrapper(logoutUser));
router.post('/refresh', ctrlWrapper(refreshToken));

export default router;
