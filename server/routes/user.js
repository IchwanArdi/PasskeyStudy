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

// User Profile
router.get('/me', authenticate, getUserProfile);
router.put('/me', authenticate, updateUserProfile);

// Device Management (Credentials)
router.get('/credentials', authenticate, getUserCredentials);
router.delete('/credentials/:id', authenticate, deleteCredential);
router.put('/credentials/:id/nickname', authenticate, updateCredentialNickname);
router.post('/credentials/add-options', authenticate, getAddDeviceOptions);
router.post('/credentials/add-verify', authenticate, verifyAddDevice);

// Admin Role Management
router.get('/admin/semua', authenticate, getAllUsers);
router.put('/admin/role', authenticate, changeUserRole);

export default router;
