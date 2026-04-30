import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';
// SCHEMA SURAT: Struktur data untuk menyimpan riwayat permohonan surat warga
const pengajuanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jenisSurat: {
      type: String,
      required: true,
      enum: ['tidak_mampu'],
    },
    // ENKRIPSI DATA MENTAH: Data sensitif (Nama, NIK, TTL, Alamat) dienkripsi secara dua arah menggunakan AES-256-CBC
    // sebelum benar-benar di-save ke dalam disk memori Database
    namaLengkap: {
      type: String,
      required: true,
      trim: true,
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    nik: {
      type: String,
      required: true,
      trim: true,
      // Implement Getter and Setter for encryption
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    tempatLahir: {
      type: String,
      required: true,
      trim: true,
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    tanggalLahir: {
      type: String, // Berubah jadi string untuk menampung encrypted payload
      required: true,
      set: (v) => {
        // Jika input berupa Date object/string biasa, ubah ke ISO string lalu enkrip
        if (v instanceof Date) return encrypt(v.toISOString());
        return encrypt(v);
      },
      get: (v) => decrypt(v),
    },
    alamat: {
      type: String,
      required: true,
      trim: true,
      set: (v) => encrypt(v),
      get: (v) => decrypt(v),
    },
    keperluan: {
      type: String,
      required: true,
      trim: true,
    },
    penghasilan: {
      type: Number,
      required: true,
      default: 0
    },
    jumlahTanggungan: {
      type: Number,
      required: true,
      default: 0
    },
    dokumenPengantar: {
      type: String, // Simpan sebagai Base64
      required: false
    },

    // Status pengajuan
    status: {
      type: String,
      enum: ['diproses', 'disetujui', 'ditolak'],
      default: 'diproses',
    },
    // Catatan dari admin
    catatanAdmin: {
      type: String,
      default: '',
    },
    // Admin yang memproses
    diprosesoleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt otomatis
    toJSON: { getters: true }, // Enable getters when converting to JSON
    toObject: { getters: true }
  }
);

// Index untuk query yang lebih cepat
pengajuanSchema.index({ userId: 1, createdAt: -1 });
pengajuanSchema.index({ status: 1, createdAt: -1 });

const Pengajuan = mongoose.model('Pengajuan', pengajuanSchema);

export default Pengajuan;
