import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserCredentials,
  deleteCredential,
  updateCredentialNickname,
  getAddDeviceOptions,
  verifyAddDevice,
  getAllUsers,
  changeUserRole
} from '../controllers/userController.js';

const router = express.Router();

// Update & Ambil data profil user
router.get('/me', authenticate, getUserProfile);
router.put('/me', authenticate, updateUserProfile);

// Manajemen perangkat (WebAuthn / Passkeys)
router.get('/credentials', authenticate, getUserCredentials);
router.delete('/credentials/:id', authenticate, deleteCredential);
router.put('/credentials/:id/nickname', authenticate, updateCredentialNickname);
router.post('/credentials/add-options', authenticate, getAddDeviceOptions);
router.post('/credentials/add-verify', authenticate, verifyAddDevice);

// Khusus Admin (Daftar semua user & ganti role)
router.get('/admin/semua', authenticate, getAllUsers);
router.put('/admin/role', authenticate, changeUserRole);

export default router;
