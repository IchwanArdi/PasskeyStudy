import { FileText, Baby, Store } from 'lucide-react';

/**
 * Komponen untuk menampilkan ikon berdasarkan jenis surat.
 * @param {string} jenis - Tipe surat (tidak_mampu, kelahiran, usaha)
 * @param {string} className - Kelas CSS tambahan untuk styling (ukuran, warna, dll)
 */
const LetterIcon = ({ jenis, className = "w-6 h-6" }) => {
  switch (jenis) {
    case 'tidak_mampu':
      return <FileText className={className} />;
    case 'kelahiran':
      return <Baby className={className} />;
    case 'usaha':
      return <Store className={className} />;
    default:
      // Ikon default jika jenis tidak dikenal
      return <FileText className={className} />;
  }
};

export default LetterIcon;
