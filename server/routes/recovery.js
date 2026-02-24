import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as recoveryController from '../controllers/recoveryController.js';

const router = express.Router();

// Generate recovery codes (authenticated)
router.post('/generate-codes', authenticate, recoveryController.generateCodes);

// Verify recovery code (unauthenticated — user lost their device)
router.post('/verify-code', recoveryController.verifyCode);

// Get re-registration options (authenticated via temp token from recovery)
router.post('/re-register-options', authenticate, recoveryController.reRegisterOptions);

// Re-register new authenticator (authenticated via temp token from recovery)
router.post('/re-register', authenticate, recoveryController.reRegister);

export default router;
