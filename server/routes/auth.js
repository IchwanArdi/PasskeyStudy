import express from 'express';
import * as webauthnController from '../controllers/webauthnController.js';

const router = express.Router();

// Route khusus WebAuthn (Passwordless)
router.post('/webauthn/register/options', webauthnController.getRegisterOptions);
router.post('/webauthn/register/verify', webauthnController.verifyRegister);
router.post('/webauthn/login/options', webauthnController.getLoginOptions);
router.post('/webauthn/login/verify', webauthnController.verifyLogin);

// Route lama (Sudah tidak digunakan) - Berikan info error 410 daripada 404
router.post('/register', webauthnController.register);
router.post('/login', webauthnController.login);

export default router;

