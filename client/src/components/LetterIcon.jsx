import { FileText, ClipboardList } from 'lucide-react';

/**
 * Komponen untuk menampilkan ikon berdasarkan jenis surat.
 * @param {string} jenis - Tipe surat (tidak_mampu)
 * @param {string} className - Kelas CSS tambahan untuk styling (ukuran, warna, dll)
 */
const LetterIcon = ({ jenis, className = "w-6 h-6" }) => {
  switch (jenis) {
    case 'tidak_mampu':
      return <FileText className={className} />;
    case 'riwayat':
      return <ClipboardList className={className} />;
    default:
      // Ikon default jika jenis tidak dikenal
      return <FileText className={className} />;
  }
};

export default LetterIcon;
