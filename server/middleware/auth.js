// import library JWT untuk verifikasi token
import jwt from 'jsonwebtoken';

// import model User dari database
import User from '../models/User.js';

// middleware untuk autentikasi user menggunakan JWT
export const authenticate = async (req, res, next) => {
  try {
    // ambil token dari header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // jika token tidak ada
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan, akses ditolak' });
    }

    // verifikasi token menggunakan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // cari user berdasarkan userId dari token
    const user = await User.findById(decoded.userId).select('-webauthnCredentials');

    // jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: 'Pengguna tidak ditemukan' });
    }

    // simpan data user ke request
    req.user = user;

    // lanjut ke middleware berikutnya
    next();
  } catch (error) {
    // token tidak valid
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

// middleware untuk mengecek apakah user adalah admin
export const admin = (req, res, next) => {
  // cek apakah user memiliki role admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // jika bukan admin
    res.status(403).json({ message: 'Akses ditolak, hanya untuk admin' });
  }
};