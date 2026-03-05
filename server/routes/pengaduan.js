import express from 'express';
import { 
  createPengaduan, 
  getMyPengaduan, 
  getAllPengaduanAdmin, 
  updateStatusPengaduan,
  upload 
} from '../controllers/pengaduanController.js';
import { authenticate, admin } from '../middleware/auth.js';

const router = express.Router();

// User Routes
router.post('/', authenticate, upload.single('foto'), createPengaduan);
router.get('/saya', authenticate, getMyPengaduan);

// Admin Routes
router.get('/admin', authenticate, admin, getAllPengaduanAdmin);
router.put('/:id', authenticate, admin, updateStatusPengaduan);

export default router;
