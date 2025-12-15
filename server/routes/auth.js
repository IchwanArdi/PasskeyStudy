import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import * as webauthnController from '../controllers/webauthnController.js';

const router = express.Router();

// Password authentication routes
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// WebAuthn routes
router.post('/webauthn/register/options', webauthnController.getRegisterOptions);
router.post('/webauthn/register/verify', webauthnController.verifyRegister);
router.post('/webauthn/login/options', webauthnController.getLoginOptions);
router.post('/webauthn/login/verify', webauthnController.verifyLogin);

export default router;

