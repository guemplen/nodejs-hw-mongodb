import express from 'express';
import {
  register,
  login,
  logout,
  refreshTokens,
} from '../controllers/authController.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  registrationSchema,
  loginSchema,
  refreshSchema,
} from '../validation/authValidation.js';

const router = express.Router();

router.post('/register', validateBody(registrationSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', validateBody(refreshSchema), refreshTokens);

export default router;
