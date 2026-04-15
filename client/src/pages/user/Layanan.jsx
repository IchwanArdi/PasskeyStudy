import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

// Data statis buat daftar layanan yang tersedia di desa
const layananList = [
  {
    id: 'tidak_mampu',
    title: 'Ket. Tidak Mampu',
    desc: 'Surat untuk keperluan bantuan sosial, keringanan biaya sekolah, atau layanan kesehatan.',
  },
];

const Layanan = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-[var(--section-border)]">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">Pusat Layanan</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Layanan Persuratan</h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-medium mt-1">Pilih jenis surat yang ingin Anda ajukan secara online.</p>
        </header>

        {/* List Kartu Layanan */}
        <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {layananList.map((item) => (
            <Link
              key={item.id}
              to={item.link || `/layanan/ajukan?jenis=${item.id}`}
              className="group relative bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--primary-border)] hover:bg-[var(--bg-overlay)] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-start gap-4">
                {/* Icon Surat */}
                <div className="w-12 h-12 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LetterIcon jenis={item.id} className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1.5 text-[var(--text)] group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{item.desc}</p>
                </div>

                <div className="self-center">
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
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
