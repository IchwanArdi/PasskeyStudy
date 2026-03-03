import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  buatPengajuan,
  getPengajuanSaya,
  semuaPengajuan,
  updateStatusPengajuan,
  detailPengajuan,
} from '../controllers/pengajuanController.js';

const router = express.Router();

// ─── Middleware admin guard ────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses hanya untuk admin.' });
  }
  next();
};

// ─── Warga routes ─────────────────────────────────────────────────────────────
router.post('/', authenticate, buatPengajuan);
router.get('/saya', authenticate, getPengajuanSaya);
router.get('/:id', authenticate, detailPengajuan);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin/semua', authenticate, adminOnly, semuaPengajuan);
router.patch('/:id/status', authenticate, adminOnly, updateStatusPengajuan);

export default router;
