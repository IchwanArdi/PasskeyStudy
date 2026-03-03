import Pengumuman from '../models/Pengumuman.js';

// ─── PUBLIK / WARGA ───────────────────────────────────────────────────────────

/**
 * GET /api/pengumuman
 * Semua user (termasuk yang belum login) bisa melihat pengumuman
 */
export const semuaPengumuman = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.find()
      .sort({ penting: -1, tanggal: -1 })
      .populate('authorId', 'username namaLengkap')
      .lean();

    res.json({ pengumuman });
  } catch (error) {
    console.error('Semua Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * GET /api/pengumuman/:id
 * Detail satu pengumuman
 */
export const detailPengumuman = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findById(req.params.id)
      .populate('authorId', 'username namaLengkap')
      .lean();

    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    res.json({ pengumuman });
  } catch (error) {
    console.error('Detail Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────

/**
 * POST /api/pengumuman
 * Admin membuat pengumuman baru
 */
export const buatPengumuman = async (req, res) => {
  try {
    const { judul, isi, penting, tanggal } = req.body;

    if (!judul?.trim() || !isi?.trim()) {
      return res.status(400).json({ message: 'Judul dan isi wajib diisi.' });
    }

    const pengumuman = await Pengumuman.create({
      judul: judul.trim(),
      isi: isi.trim(),
      penting: penting === true,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      authorId: req.user._id,
    });

    res.status(201).json({ message: 'Pengumuman berhasil dibuat.', pengumuman });
  } catch (error) {
    console.error('Buat Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * PUT /api/pengumuman/:id
 * Admin mengedit pengumuman
 */
export const editPengumuman = async (req, res) => {
  try {
    const { judul, isi, penting, tanggal } = req.body;

    const pengumuman = await Pengumuman.findByIdAndUpdate(
      req.params.id,
      {
        ...(judul && { judul: judul.trim() }),
        ...(isi && { isi: isi.trim() }),
        ...(typeof penting === 'boolean' && { penting }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
      },
      { new: true }
    );

    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    res.json({ message: 'Pengumuman berhasil diperbarui.', pengumuman });
  } catch (error) {
    console.error('Edit Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * DELETE /api/pengumuman/:id
 * Admin menghapus pengumuman
 */
export const hapusPengumuman = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findByIdAndDelete(req.params.id);

    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    res.json({ message: 'Pengumuman berhasil dihapus.' });
  } catch (error) {
    console.error('Hapus Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
