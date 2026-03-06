import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Clock, Star } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

// Data statis buat daftar layanan yang tersedia di desa
const layananList = [
  {
    id: 'tidak_mampu',
    title: 'Ket. Tidak Mampu',
    desc: 'Surat untuk keperluan bantuan sosial, keringanan biaya sekolah, atau layanan kesehatan.',
    time: '1-2 Hari Kerja',
    featured: true
  },
  {
    id: 'kelahiran',
    title: 'Ket. Kelahiran',
    desc: 'Surat keterangan untuk pengurusan akta kelahiran anak yang baru lahir.',
    time: '1 Hari Kerja',
    featured: false
  },
  {
    id: 'usaha',
    title: 'Ket. Usaha',
    desc: 'Surat keterangan kepemilikan usaha untuk pengajuan kredit atau izin lingkungan.',
    time: '2 Hari Kerja',
    featured: false
  },
  {
    id: 'riwayat',
    title: 'Detail Pengajuan',
    desc: 'Lihat status dan riwayat lengkap surat-surat yang pernah Anda ajukan.',
    time: 'Instan',
    featured: false,
    link: '/riwayat'
  },
];

const Layanan = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Atas: Judul dan Penjelasan Singkat */}
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-white/5">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-2">Pusat Layanan</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Layanan Persuratan</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Pilih jenis surat yang ingin Anda ajukan secara online.</p>
        </header>

        {/* List Kartu Layanan */}
        <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {layananList.map((item) => (
            <Link
              key={item.id}
              to={item.link || `/layanan/ajukan?jenis=${item.id}`}
              className="group relative bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-6 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
            >
              {/* Dekorasi kartu kalau layanannya lagi populer/penting */}
              {item.featured && (
                <div className="absolute top-0 right-0 p-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                {/* Icon Surat (Pakai komponen LetterIcon biar keren) */}
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LetterIcon jenis={item.id} className="w-6 h-6 text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1.5 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                  
                  {/* Info waktu proses */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/5 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-blue-500/50" />
                      Pros: {item.time}
                    </div>
                  </div>
                </div>

                <div className="self-center">
                  <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layanan;
