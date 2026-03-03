import mongoose from 'mongoose';

const pengumumanSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    isi: {
      type: String,
      required: true,
    },
    // Admin yang membuat / mengupdate
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Tandai pengumuman penting
    penting: {
      type: Boolean,
      default: false,
    },
    // Tanggal pengumuman (boleh berbeda dari createdAt)
    tanggal: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

pengumumanSchema.index({ tanggal: -1 });

const Pengumuman = mongoose.model('Pengumuman', pengumumanSchema);

export default Pengumuman;
