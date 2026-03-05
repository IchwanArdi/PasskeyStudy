import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const pengaduanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Data pelapor terenkripsi untuk audit internal (tetap anonim di UI)
    namaPelapor: {
      type: String,
      required: true,
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    nikPelapor: {
      type: String,
      required: true,
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    kategori: {
      type: String,
      required: true,
      enum: ['jalan_rusak', 'sampah_lingkungan', 'lampu_jalan', 'fasilitas_umum'],
    },
    deskripsi: {
      type: String,
      required: true,
      trim: true,
    },
    foto: {
      type: String, // Path ke file gambar
      required: true,
    },
    status: {
      type: String,
      enum: ['terkirim', 'diproses', 'selesai'],
      default: 'terkirim',
    },
    catatanAdmin: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexing
pengaduanSchema.index({ userId: 1, createdAt: -1 });
pengaduanSchema.index({ status: 1, createdAt: -1 });

const Pengaduan = mongoose.model('Pengaduan', pengaduanSchema);

export default Pengaduan;
