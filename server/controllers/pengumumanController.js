import Pengumuman from '../models/Pengumuman.js';

// ========================== WARGA ==========================

// mengambil semua pengumuman desa
export const semuaPengumuman = async (req, res) => {
  try {
    // ambil semua pengumuman, prioritaskan yang penting lalu terbaru
    const pengumuman = await Pengumuman.find()
      .sort({ penting: -1, tanggal: -1 })
      .populate('authorId', 'username namaLengkap') // ambil data penulis
      .lean(); // ubah ke object biasa

    // kirim daftar pengumuman
    res.json({ pengumuman });
  } catch (error) {
    console.error('Semua Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// mengambil detail satu pengumuman berdasarkan id
export const detailPengumuman = async (req, res) => {
  try {
    // cari pengumuman berdasarkan id
    const pengumuman = await Pengumuman.findById(req.params.id)
      .populate('authorId', 'username namaLengkap')
      .lean();

    // jika pengumuman tidak ditemukan
    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    // kirim data pengumuman
    res.json({ pengumuman });
  } catch (error) {
    console.error('Detail Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ============================ ADMIN ============================

// membuat pengumuman baru
export const buatPengumuman = async (req, res) => {
  try {
    // ambil data dari body request
    const { judul, isi, penting, tanggal } = req.body;

    // validasi judul dan isi
    if (!judul?.trim() || !isi?.trim()) {
      return res.status(400).json({ message: 'Judul dan isi wajib diisi.' });
    }

    // simpan pengumuman ke database
    const pengumuman = await Pengumuman.create({
      judul: judul.trim(),
      isi: isi.trim(),
      penting: penting === true,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      authorId: req.user._id, // admin pembuat
    });

    // kirim response berhasil
    res.status(201).json({ message: 'Pengumuman berhasil dibuat.', pengumuman });
  } catch (error) {
    console.error('Buat Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// mengedit pengumuman berdasarkan id
export const editPengumuman = async (req, res) => {
  try {
    // ambil data dari body request
    const { judul, isi, penting, tanggal } = req.body;

    // update data pengumuman
    const pengumuman = await Pengumuman.findByIdAndUpdate(
      req.params.id,
      {
        ...(judul && { judul: judul.trim() }),
        ...(isi && { isi: isi.trim() }),
        ...(typeof penting === 'boolean' && { penting }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
      },
      { new: true } // kembalikan data terbaru
    );

    // jika pengumuman tidak ditemukan
    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    // kirim response berhasil
    res.json({ message: 'Pengumuman berhasil diperbarui.', pengumuman });
  } catch (error) {
    console.error('Edit Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// menghapus pengumuman berdasarkan id
export const hapusPengumuman = async (req, res) => {
  try {
    // hapus pengumuman dari database
    const pengumuman = await Pengumuman.findByIdAndDelete(req.params.id);

    // jika pengumuman tidak ditemukan
    if (!pengumuman) {
      return res.status(404).json({ message: 'Pengumuman tidak ditemukan.' });
    }

    // kirim response berhasil
    res.json({ message: 'Pengumuman berhasil dihapus.' });
  } catch (error) {
    console.error('Hapus Pengumuman Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};