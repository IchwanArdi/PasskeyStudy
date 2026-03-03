import Pengajuan from '../models/Pengajuan.js';

// ─── WARGA ────────────────────────────────────────────────────────────────────

/**
 * POST /api/pengajuan
 * Warga membuat pengajuan surat baru
 */
export const buatPengajuan = async (req, res) => {
  try {
    const { jenisSurat, namaLengkap, nik, tempatLahir, tanggalLahir, alamat, keperluan } = req.body;

    if (!jenisSurat || !namaLengkap || !nik || !tempatLahir || !tanggalLahir || !alamat || !keperluan) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const jenisValid = ['domisili', 'tidak_mampu', 'kelahiran', 'kematian', 'usaha'];
    if (!jenisValid.includes(jenisSurat)) {
      return res.status(400).json({ message: 'Jenis surat tidak valid.' });
    }

    const pengajuan = await Pengajuan.create({
      userId: req.user._id,
      jenisSurat,
      namaLengkap: namaLengkap.trim(),
      nik: nik.trim(),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir: new Date(tanggalLahir),
      alamat: alamat.trim(),
      keperluan: keperluan.trim(),
    });

    res.status(201).json({ message: 'Pengajuan berhasil dikirim.', pengajuan });
  } catch (error) {
    console.error('Buat Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * GET /api/pengajuan/saya
 * Warga melihat riwayat pengajuannya sendiri
 */
export const getPengajuanSaya = async (req, res) => {
  try {
    const pengajuan = await Pengajuan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ pengajuan });
  } catch (error) {
    console.error('Get Pengajuan Saya Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * GET /api/pengajuan/admin
 * Admin melihat semua pengajuan (bisa filter by status)
 */
export const semuaPengajuan = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pengajuan = await Pengajuan.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email namaLengkap')
      .lean();

    res.json({ pengajuan });
  } catch (error) {
    console.error('Semua Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * PATCH /api/pengajuan/:id/status
 * Admin mengubah status pengajuan: diproses | disetujui | ditolak
 */
export const updateStatusPengajuan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatanAdmin } = req.body;

    const statusValid = ['diproses', 'disetujui', 'ditolak'];
    if (!statusValid.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const pengajuan = await Pengajuan.findByIdAndUpdate(
      id,
      {
        status,
        catatanAdmin: catatanAdmin?.trim() || '',
        diprosesoleh: req.user._id,
      },
      { new: true }
    );

    if (!pengajuan) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    res.json({ message: 'Status pengajuan diperbarui.', pengajuan });
  } catch (error) {
    console.error('Update Status Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * GET /api/pengajuan/:id
 * Lihat detail satu pengajuan (warga = hanya miliknya, admin = semua)
 */
export const detailPengajuan = async (req, res) => {
  try {
    const pengajuan = await Pengajuan.findById(req.params.id)
      .populate('userId', 'username email namaLengkap')
      .lean();

    if (!pengajuan) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = pengajuan.userId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res.json({ pengajuan });
  } catch (error) {
    console.error('Detail Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
