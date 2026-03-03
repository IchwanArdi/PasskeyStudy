import mongoose from 'mongoose';

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
      enum: ['domisili', 'tidak_mampu', 'kelahiran', 'kematian', 'usaha'],
    },
    // Data pemohon
    namaLengkap: {
      type: String,
      required: true,
      trim: true,
    },
    nik: {
      type: String,
      required: true,
      trim: true,
    },
    tempatLahir: {
      type: String,
      required: true,
      trim: true,
    },
    tanggalLahir: {
      type: Date,
      required: true,
    },
    alamat: {
      type: String,
      required: true,
      trim: true,
    },
    keperluan: {
      type: String,
      required: true,
      trim: true,
    },
    // Status pengajuan
    status: {
      type: String,
      enum: ['menunggu', 'diproses', 'disetujui', 'ditolak'],
      default: 'menunggu',
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
  }
);

// Index untuk query yang lebih cepat
pengajuanSchema.index({ userId: 1, createdAt: -1 });
pengajuanSchema.index({ status: 1, createdAt: -1 });

const Pengajuan = mongoose.model('Pengajuan', pengajuanSchema);

export default Pengajuan;
