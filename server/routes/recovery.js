import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as recoveryController from '../controllers/recoveryController.js';

const router = express.Router();

// Bikin kode pemulihan (harus login dulu)
router.post('/generate-codes', authenticate, recoveryController.generateCodes);

// Cek kode pemulihan kalo user kehilangan HP/perangkat
router.post('/verify-code', recoveryController.verifyCode);

// Persiapan daftar ulang perangkat baru (setelah verifikasi kode)
router.post('/re-register-options', authenticate, recoveryController.reRegisterOptions);

// Proses simpan perangkat baru ke akun
router.post('/re-register', authenticate, recoveryController.reRegister);

// Khusus Admin: Bikin kode darurat buat warga
router.post('/admin/emergency-code', authenticate, recoveryController.adminGenerateEmergencyCode);

export default router;
