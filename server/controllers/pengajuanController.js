import Pengajuan from '../models/Pengajuan.js';
import { generateSuratPDF } from '../utils/pdfGenerator.js';
import { decrypt } from '../utils/encryption.js';

// --- BAGIAN UNTUK WARGA ---

// Fungsi buat bikin pengajuan surat baru
export const buatPengajuan = async (req, res) => {
  try {
    const { jenisSurat, namaLengkap, nik, tempatLahir, tanggalLahir, alamat, keperluan, dataTambahan } = req.body;

    // Validasi input: Pastikan gak ada data wajib yang kosong
    if (!jenisSurat || !namaLengkap || !nik || !tempatLahir || !tanggalLahir || !alamat || !keperluan) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    // Cek apakah jenis suratnya ada dalam daftar yang diizinkan
    const jenisValid = ['tidak_mampu', 'kelahiran', 'usaha'];
    if (!jenisValid.includes(jenisSurat)) {
      return res.status(400).json({ message: 'Jenis surat tidak valid.' });
    }

    // Simpan data ke database. 
    // Data sensitif (NIK, dll) otomatis di-enkripsi oleh Mongoose middleware sebelum masuk ke DB.
    const pengajuan = await Pengajuan.create({
      userId: req.user._id,
      jenisSurat,
      namaLengkap: namaLengkap.trim(),
      nik: nik.trim(),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir: new Date(tanggalLahir),
      alamat: alamat.trim(),
      keperluan: keperluan.trim(),
      dataTambahan: dataTambahan || {}, 
    });

    res.status(201).json({ message: 'Pengajuan berhasil dikirim.', pengajuan });
  } catch (error) {
    console.error('Buat Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Ambil riwayat pengajuan milik user yang sedang login
export const getPengajuanSaya = async (req, res) => {
  try {
    // Kita pakai .lean() biar performa lebih cepat (data cuma POJO/Objek JS biasa)
    // TAPI: Karena pakai .lean(), Mongoose gak otomatis nge-dekripsi datanya. Jadi harus kita dekripsi manual.
    const pengajuan = await Pengajuan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Proses dekripsi data satu-satu biar bisa dibaca di frontend
    const pengajuanDecrypted = pengajuan.map(p => ({
      ...p,
      nik: decrypt(p.nik),
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: new Date(decrypt(p.tanggalLahir)), 
      alamat: decrypt(p.alamat)
    }));

    res.json({ pengajuan: pengajuanDecrypted });
  } catch (error) {
    console.error('Get Pengajuan Saya Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// --- BAGIAN KHUSUS ADMIN ---

// Admin bisa liat semua pengajuan yang masuk dari warga
export const semuaPengajuan = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pengajuan = await Pengajuan.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email namaLengkap')
      .lean();

    // Sama seperti di atas, kita harus dekripsi manual karena pakai .lean()
    const pengajuanDecrypted = pengajuan.map(p => ({
      ...p,
      nik: decrypt(p.nik),
      namaLengkap: decrypt(p.namaLengkap),
      tempatLahir: decrypt(p.tempatLahir),
      tanggalLahir: new Date(decrypt(p.tanggalLahir)), 
      alamat: decrypt(p.alamat)
    }));

    res.json({ pengajuan: pengajuanDecrypted });
  } catch (error) {
    console.error('Semua Pengajuan Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Admin mengubah status pengajuan (Misal: Disetujui atau Ditolak)
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
        diprosesoleh: req.user._id, // Catat admin mana yang memproses
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

// Liat detail satu pengajuan secara lengkap
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

    // Proteksi: Cuma pemilik atau admin yang boleh liat detail ini
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    // Dekripsi data biar bisa dibaca di layar detail
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

// Bikin file PDF otomatis dan kirim ke user buat didownload
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

    // Surat cuma bisa diunduh kalau sudah di-ACC (disetujui) oleh admin
    if (pengajuan.status !== 'disetujui') {
      return res.status(400).json({ message: 'Dokumen belum tersedia atau belum disetujui.' });
    }

    // Penting: Dekripsi dulu datanya sebelum dimasukkan ke dalam PDF
    pengajuan.nik = decrypt(pengajuan.nik);
    pengajuan.namaLengkap = decrypt(pengajuan.namaLengkap);
    pengajuan.tempatLahir = decrypt(pengajuan.tempatLahir);
    pengajuan.tanggalLahir = new Date(decrypt(pengajuan.tanggalLahir));
    pengajuan.alamat = decrypt(pengajuan.alamat);

    // Proses pembuatan PDF (lewat utilitas pdfGenerator)
    const pdfBytes = await generateSuratPDF(pengajuan);
    const pdfBuffer = Buffer.from(pdfBytes);

    // Bikin nama file yang rapi (format: Surat_jenis_nik.pdf)
    const jenisSafe = pengajuan.jenisSurat.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Surat_${jenisSafe}_${pengajuan.nik}.pdf`;

    // Kirim header agar browser mengenali ini sebagai file PDF untuk didownload
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF.' });
  }
};

// Hapus pengajuan dari sistem
export const hapusPengajuan = async (req, res) => {
  try {
    const pengajuan = await Pengajuan.findById(req.params.id);

    if (!pengajuan) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = pengajuan.userId.toString() === req.user._id.toString();

    // Pastikan yang menghapus adalah pemiliknya sendiri atau admin
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
