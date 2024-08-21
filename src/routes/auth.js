import express from 'express';
import {
  register,
  login,
  logout,
  refreshTokens,
  sendResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  registrationSchema,
  loginSchema,
  refreshSchema,
  resetEmailSchema,
  resetPasswordSchema,
} from '../validation/authValidation.js';

const router = express.Router();

router.post('/register', validateBody(registrationSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', validateBody(refreshSchema), refreshTokens);
router.post(
  '/send-reset-email',
  validateBody(resetEmailSchema),
  sendResetEmail,
);
router.post('/reset-pwd', validateBody(resetPasswordSchema), resetPassword);

export default router;
