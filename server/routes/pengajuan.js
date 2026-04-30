import express from 'express';
import Pengajuan from '../models/Pengajuan.js';
import { decrypt } from '../utils/encryption.js';
import { generateSuratPDF } from '../utils/pdfGenerator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware cek admin
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Akses khusus admin' });
  next();
};

// --- 1. UNTUK WARGA ---

// Buat pengajuan baru
router.post('/', authenticate, async (req, res) => {
  try {
    const { jenisSurat, namaLengkap, nik, tempatLahir, tanggalLahir, alamat, keperluan, penghasilan, jumlahTanggungan, dokumenPengantar } = req.body;
    if (!jenisSurat || !namaLengkap || !nik) return res.status(400).json({ message: 'Data wajib diisi' });

    const pengajuan = await Pengajuan.create({
      userId: req.user._id,
      jenisSurat,
      namaLengkap: namaLengkap.trim(),
      nik: nik.trim(),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir: new Date(tanggalLahir),
      alamat: alamat.trim(),
      keperluan: keperluan.trim(),
      penghasilan: Number(penghasilan) || 0,
      jumlahTanggungan: Number(jumlahTanggungan) || 0,
      dokumenPengantar: dokumenPengantar || null
    });
    res.status(201).json({ message: 'Pengajuan terkirim', pengajuan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal kirim pengajuan' });
  }
});

// Liat daftar pengajuan saya (Riwayat)
router.get('/saya', authenticate, async (req, res) => {
  try {
    const list = await Pengajuan.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    // Dekripsi biar tampil teks aslinya
    const decrypted = list.map(p => ({ 
      ...p, 
      nik: decrypt(p.nik), 
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: decrypt(p.tanggalLahir),
      alamat: decrypt(p.alamat) 
    }));
    res.json({ pengajuan: decrypted });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data' });
  }
});

// Detail satu pengajuan
router.get('/:id', authenticate, async (req, res) => {
  try {
    let p = await Pengajuan.findById(req.params.id).populate('userId', 'username nik').lean();
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });

    // Proteksi: Cuma pemilik atau admin
    if (req.user.role !== 'admin' && p.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    
    p.nik = decrypt(p.nik);
    p.namaLengkap = decrypt(p.namaLengkap);
    p.tempatLahir = decrypt(p.tempatLahir);
    p.tanggalLahir = decrypt(p.tanggalLahir);
    p.alamat = decrypt(p.alamat);
    res.json({ pengajuan: p });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download PDF (Jika sudah disetujui)
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    let p = await Pengajuan.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Data tidak ada' });
    if (p.status !== 'disetujui') return res.status(400).json({ message: 'Surat belum disetujui admin' });
    
    p.nik = decrypt(p.nik);
    p.namaLengkap = decrypt(p.namaLengkap);
    p.tempatLahir = decrypt(p.tempatLahir);
    p.tanggalLahir = decrypt(p.tanggalLahir);
    p.alamat = decrypt(p.alamat);
    
    const pdfBytes = await generateSuratPDF(p);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Surat_${p.nik}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Gagal membuat PDF' });
  }
});

// Hapus pengajuan (Milik sendiri atau Admin)
router.delete('/:id', authenticate, async (req, res) => {
  const p = await Pengajuan.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Data tidak ada' });
  if (req.user.role !== 'admin' && p.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  await p.deleteOne();
  res.json({ message: 'Berhasil dihapus' });
});

// --- 2. UNTUK ADMIN ---

// Liat semua pengajuan masuk
router.get('/admin/semua', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const list = await Pengajuan.find(filter).sort({ createdAt: -1 }).populate('userId', 'username nik').lean();
    const decrypted = list.map(p => ({ 
      ...p, 
      nik: decrypt(p.nik), 
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: decrypt(p.tanggalLahir),
      alamat: decrypt(p.alamat) 
    }));
    res.json({ pengajuan: decrypted });
  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data admin' });
  }
});

// Update status (ACC / Tolak)
router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  const { status, catatanAdmin } = req.body;
  try {
    const p = await Pengajuan.findByIdAndUpdate(
      req.params.id, 
      { status, catatanAdmin, diprosesoleh: req.user._id }, 
      { new: true }
    );
    res.json({ message: 'Status surat diperbarui', pengajuan: p });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update status' });
  }
});

export default router;
