import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generateSuratPDF = async (pengajuan) => {
  // Buat dokumen PDF baru
  const pdfDoc = await PDFDocument.create();
  
  // Tambah halaman (A4: 595.28 x 841.89)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Embed font (Helvetica biasa dan bold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Fungsi utilitas untuk menggambar teks ke tengah
  const drawCenteredText = (text, y, font, size) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // --- KOP SURAT ---
  drawCenteredText('PEMERINTAH KABUPATEN CILACAP', height - 60, fontBold, 16);
  drawCenteredText('KECAMATAN KARANGPUCUNG', height - 80, fontBold, 16);
  drawCenteredText('KANTOR KEPALA DESA KARANGPUCUNG', height - 100, fontBold, 18);
  drawCenteredText('Jl. Raya Karangpucung No. 1, Kode Pos 53255', height - 120, fontRegular, 10);

  // Garis pemisah kop surat
  page.drawLine({
    start: { x: 50, y: height - 130 },
    end: { x: width - 50, y: height - 130 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 50, y: height - 133 },
    end: { x: width - 50, y: height - 133 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // --- JUDUL SURAT ---
  const jenisLabelMap = {
    tidak_mampu: 'KETERANGAN TIDAK MAMPU',
    kelahiran: 'KETERANGAN KELAHIRAN',
    usaha: 'KETERANGAN USAHA',
  };
  const judulSurat = `SURAT ${jenisLabelMap[pengajuan.jenisSurat] || 'KETERANGAN'}`;
  
  const judulY = height - 170;
  drawCenteredText(judulSurat, judulY, fontBold, 14);
  
  // Garis bawah untuk judul
  const judulWidth = fontBold.widthOfTextAtSize(judulSurat, 14);
  page.drawLine({
    start: { x: (width - judulWidth) / 2, y: judulY - 3 },
    end: { x: (width + judulWidth) / 2, y: judulY - 3 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const noSurat = `Nomor: 470 / ${pengajuan._id.toString().slice(-4).toUpperCase()} / 2026`;
  drawCenteredText(noSurat, judulY - 15, fontRegular, 11);

  // --- ISI SURAT ---
  let cursorY = height - 220;
  const leftMargin = 60;
  const colSize = 130; // Lebar untuk label (misal "Nama Lengkap")

  page.drawText('Yang bertanda tangan di bawah ini Kepala Desa Karangpucung, menerangkan dengan', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });
  cursorY -= 15;
  page.drawText('sesungguhnya bahwa:', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });

  cursorY -= 30;

  const dataPemohon = [
    { label: 'Nama Lengkap', value: pengajuan.namaLengkap.toUpperCase() },
    { label: 'NIK', value: pengajuan.nik },
    { label: 'Tempat, Tgl Lahir', value: `${pengajuan.tempatLahir}, ${new Date(pengajuan.tanggalLahir).toLocaleDateString('id-ID')}` },
    { label: 'Alamat KTP', value: '' } // Spacing khusus untuk alamat panjang
  ];

  dataPemohon.forEach(({ label, value }) => {
    page.drawText(label, { x: leftMargin + 20, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
    page.drawText(':', { x: leftMargin + 20 + colSize, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
    if (value) {
      page.drawText(value, { x: leftMargin + 20 + colSize + 10, y: cursorY, size: 11, font: fontBold, color: rgb(0, 0, 0) });
    }
    cursorY -= 20;
  });

  // Handle alamat multilines
  const alamatLines = pengajuan.alamat.split('\n');
  cursorY += 20; // reset dari loop atas
  alamatLines.forEach(line => {
    page.drawText(line.trim(), { x: leftMargin + 20 + colSize + 10, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
    cursorY -= 15;
  });

  // Render Data Tambahan (Dynamic Fields)
  if (pengajuan.dataTambahan && Object.keys(pengajuan.dataTambahan).length > 0) {
    cursorY -= 10;
    Object.entries(pengajuan.dataTambahan).forEach(([key, value]) => {
      // Format key like "tujuanUsaha" to "Tujuan Usaha"
      const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      page.drawText(formattedLabel, { x: leftMargin + 20, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
      page.drawText(':', { x: leftMargin + 20 + colSize, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
      if (value) {
        page.drawText(String(value), { x: leftMargin + 20 + colSize + 10, y: cursorY, size: 11, font: fontBold, color: rgb(0, 0, 0) });
      }
      cursorY -= 20;
    });
  }

  cursorY -= 10;
  page.drawText('Adalah benar penduduk Desa Karangpucung dan berdomisili di alamat tersebut di atas.', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });
  
  cursorY -= 20;
  page.drawText('Surat keterangan ini dibuat untuk keperluan:', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });

  cursorY -= 20;
  page.drawText(`"${pengajuan.keperluan}"`, {
    x: leftMargin + 20, y: cursorY, size: 11, font: fontBold, color: rgb(0, 0, 0),
  });

  cursorY -= 30;
  page.drawText('Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });
  cursorY -= 15;
  page.drawText('sebagaimana mestinya.', {
    x: leftMargin, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });

  // --- TANDA TANGAN ---
  cursorY -= 50;
  const ttdX = width - 200;
  const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  
  page.drawText(`Karangpucung, ${today}`, {
    x: ttdX, y: cursorY, size: 11, font: fontRegular, color: rgb(0, 0, 0),
  });
  
  cursorY -= 15;
  page.drawText('Kepala Desa Karangpucung', {
    x: ttdX, y: cursorY, size: 11, font: fontBold, color: rgb(0, 0, 0),
  });

  // Area TTD
  cursorY -= 60;
  
  page.drawText('( .................................................. )', {
    x: ttdX - 10, y: cursorY, size: 11, font: fontBold, color: rgb(0, 0, 0),
  });

  // Return byte array
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
