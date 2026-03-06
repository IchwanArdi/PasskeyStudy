import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  buatPengajuan,
  getPengajuanSaya,
  semuaPengajuan,
  updateStatusPengajuan,
  detailPengajuan,
  downloadSuratPDF,
  hapusPengajuan,
} from '../controllers/pengajuanController.js';

const router = express.Router();

// Middleware buat cek apakah yang login itu Admin
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak, khusus admin.' });
  }
  next();
};

// Route khusus Admin (Kelola semua pengajuan warga)
router.get('/admin', authenticate, adminOnly, semuaPengajuan);
router.get('/admin/semua', authenticate, adminOnly, semuaPengajuan);
router.patch('/:id/status', authenticate, adminOnly, updateStatusPengajuan);

// Route buat Warga (Bikin & liat status pengajuan sendiri)
router.post('/', authenticate, buatPengajuan);
router.get('/saya', authenticate, getPengajuanSaya);
router.get('/:id', authenticate, detailPengajuan);
router.get('/:id/pdf', authenticate, downloadSuratPDF);
router.delete('/:id', authenticate, hapusPengajuan);

export default router;
