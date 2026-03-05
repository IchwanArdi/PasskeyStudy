import Pengajuan from '../models/Pengajuan.js';
import { generateSuratPDF } from '../utils/pdfGenerator.js';
import { decrypt } from '../utils/encryption.js';

// ─── WARGA ────────────────────────────────────────────────────────────────────

/**
 * ALUR PELAYANAN 1 (WARGA): Endpoint POST /api/pengajuan
 * Warga (yang sudah authentikasi via FIDO) mengunggah formulir pengajuan surat baru ke database
 */
export const buatPengajuan = async (req, res) => {
  try {
    const { jenisSurat, namaLengkap, nik, tempatLahir, tanggalLahir, alamat, keperluan, dataTambahan } = req.body;

    if (!jenisSurat || !namaLengkap || !nik || !tempatLahir || !tanggalLahir || !alamat || !keperluan) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const jenisValid = ['tidak_mampu', 'kelahiran', 'usaha'];
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
      dataTambahan: dataTambahan || {}, // Simpan field dinamis
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

    // Pastikan data dekripsi jika mengambil data menggunakan lean()
    const pengajuanDecrypted = pengajuan.map(p => ({
      ...p,
      nik: decrypt(p.nik),
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: new Date(decrypt(p.tanggalLahir)), // Kembalikan string iso ke Date
      alamat: decrypt(p.alamat)
    }));

    res.json({ pengajuan: pengajuanDecrypted });
  } catch (error) {
    console.error('Get Pengajuan Saya Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * ALUR PELAYANAN 2 (ADMIN): Endpoint GET /api/pengajuan/admin
 * Admin melihat seluruh antrian pengajuan surat yang masuk. (Data yang diambil dari DB akan di-dekripsi)
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

    // Pastikan data dekripsi jika mengambil data menggunakan lean() untuk admin
    const pengajuanDecrypted = pengajuan.map(p => ({
      ...p,
      nik: decrypt(p.nik),
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: new Date(decrypt(p.tanggalLahir)), // Kembalikan string iso ke Date
      alamat: decrypt(p.alamat)
    }));

    res.json({ pengajuan: pengajuanDecrypted });
  } catch (error) {
    console.error('Semua Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * ALUR PELAYANAN 3 (ADMIN): Endpoint PATCH /api/pengajuan/:id/status
 * Admin mengeksekusi nasib surat (mengubah status dari 'diproses' ke 'disetujui' atau 'ditolak')
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
    let pengajuan = await Pengajuan.findById(req.params.id)
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

    // Dekripsi NIK karena kita pakai lean()
    pengajuan.nik = decrypt(pengajuan.nik);
    pengajuan.namaLengkap = decrypt(pengajuan.namaLengkap);
    pengajuan.tempatLahir = decrypt(pengajuan.tempatLahir);
    pengajuan.tanggalLahir = new Date(decrypt(pengajuan.tanggalLahir));
    pengajuan.alamat = decrypt(pengajuan.alamat);

    res.json({ pengajuan });
  } catch (error) {
    console.error('Detail Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * ALUR PELAYANAN 4 (SISTEM): Endpoint GET /api/pengajuan/:id/pdf
 * Secara otomatis menghasilkan sebuah file PDF layout Surat Keterangan Desa resmi (menggunakan pdf-lib) 
 * jika status permohonan sudah 'disetujui'
 */
export const downloadSuratPDF = async (req, res) => {
  try {
    let pengajuan = await Pengajuan.findById(req.params.id)
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

    if (pengajuan.status !== 'disetujui') {
      return res.status(400).json({ message: 'Dokumen belum tersedia atau belum disetujui.' });
    }

    // Dekripsi Data Sensitif
    pengajuan.nik = decrypt(pengajuan.nik);
    pengajuan.namaLengkap = decrypt(pengajuan.namaLengkap);
    pengajuan.tempatLahir = decrypt(pengajuan.tempatLahir);
    pengajuan.tanggalLahir = new Date(decrypt(pengajuan.tanggalLahir));
    pengajuan.alamat = decrypt(pengajuan.alamat);

    // Generate PDF buffer
    const pdfBytes = await generateSuratPDF(pengajuan);
    const pdfBuffer = Buffer.from(pdfBytes);

    const jenisSafe = pengajuan.jenisSurat.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Surat_${jenisSafe}_${pengajuan.nik}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF.' });
  }
};

/**
 * DELETE /api/pengajuan/:id
 * Hapus pengajuan (Admin hapus apa saja, Warga hanya miliknya)
 */
export const hapusPengajuan = async (req, res) => {
  try {
    const pengajuan = await Pengajuan.findById(req.params.id);

    if (!pengajuan) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = pengajuan.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak berhak menghapus pengajuan ini.' });
    }

    await pengajuan.deleteOne();
    res.json({ message: 'Pengajuan berhasil dihapus.' });
  } catch (error) {
    console.error('Hapus Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pengajuan.' });
  }
};
