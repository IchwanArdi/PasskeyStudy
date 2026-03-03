import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  semuaPengumuman,
  detailPengumuman,
  buatPengumuman,
  editPengumuman,
  hapusPengumuman,
} from '../controllers/pengumumanController.js';

const router = express.Router();

// ─── Middleware admin guard ────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses hanya untuk admin.' });
  }
  next();
};

// ─── Public / warga routes (read-only) ───────────────────────────────────────
router.get('/', semuaPengumuman);          // Bisa diakses tanpa login
router.get('/:id', detailPengumuman);      // Bisa diakses tanpa login

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.post('/', authenticate, adminOnly, buatPengumuman);
router.put('/:id', authenticate, adminOnly, editPengumuman);
router.delete('/:id', authenticate, adminOnly, hapusPengumuman);

export default router;
