import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const layananList = [
  {
    jenis: 'tidak_mampu',
    label: 'Ket. Tidak Mampu',
    desc: 'Surat pernyataan untuk mendapatkan keringanan biaya/bantuan.',
    waktu: '1–3 hari kerja',
  },
  {
    jenis: 'kelahiran',
    label: 'Ket. Kelahiran',
    desc: 'Pernyataan kelahiran warga untuk pelaporan ke dinas terkait.',
    waktu: '1–2 hari kerja',
  },
  {
    jenis: 'usaha',
    label: 'Ket. Usaha',
    desc: 'Keterangan kepemilikan usaha untuk pengajuan kredit/izin.',
    waktu: '2–3 hari kerja',
  },
];

const Layanan = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      
      <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-white/5">
        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">Desa Karangpucung</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Layanan Surat</h1>
        <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Pilih jenis surat yang ingin diajukan secara mandiri.</p>
      </header>

      <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {layananList.map((l) => (
          <Link
            key={l.jenis}
            to={`/layanan/ajukan?jenis=${l.jenis}`}
            className="flex flex-col p-6 md:p-8 glass-card rounded-[32px] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all group relative overflow-hidden"
          >
            {/* Decorative background icon */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LetterIcon jenis={l.jenis} className="w-24 h-24 text-emerald-400" />
            </div>

            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/10">
              <LetterIcon jenis={l.jenis} className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
            </div>
            
            <div className="flex-1 flex flex-col">
              <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-gray-100 group-hover:text-emerald-400 transition-colors">{l.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6 line-clamp-2">{l.desc}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3" /> {l.waktu}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Layanan;
