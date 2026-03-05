import Pengaduan from '../models/Pengaduan.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/pengaduan';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'lap-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar yang diperbolehkan!'));
  },
});

// Create New Pengaduan
export const createPengaduan = async (req, res) => {
  try {
    const { kategori, deskripsi } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Foto bukti pengaduan wajib dilampirkan' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const newPengaduan = new Pengaduan({
      userId: req.user.id,
      namaPelapor: user.username, // Karena User model kita saat ini hanya punya username dan email (berdasarkan context lampau)
      nikPelapor: req.user.id, // Placeholder NIK jika tidak ada di user model, namun akan dienkrip di model
      kategori,
      deskripsi,
      foto: req.file.path,
    });

    await newPengaduan.save();

    res.status(201).json({
      message: 'Pengaduan berhasil terkirim secara anonim',
      pengaduan: newPengaduan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim pengaduan', error: error.message });
  }
};

// Get User's Own Pengaduan
export const getMyPengaduan = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ pengaduan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengaduan', error: error.message });
  }
};

// Admin: Get All Pengaduan (ANONYMOUS VIEW)
export const getAllPengaduanAdmin = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.find().sort({ createdAt: -1 });
    
    // Pastikan data pelapor disensor alias anonim untuk admin sekalipun sesuai permintaan
    const anonymousReports = pengaduan.map(p => {
      const obj = p.toObject();
      delete obj.namaPelapor;
      delete obj.nikPelapor;
      delete obj.userId;
      return obj;
    });

    res.json({ pengaduan: anonymousReports });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengaduan', error: error.message });
  }
};

// Update Status (Admin)
export const updateStatusPengaduan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatanAdmin } = req.body;

    const pengaduan = await Pengaduan.findByIdAndUpdate(
      id,
      { status, catatanAdmin },
      { new: true }
    );

    if (!pengaduan) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan' });
    }

    res.json({ message: 'Status pengaduan diperbarui', pengaduan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status', error: error.message });
  }
};
