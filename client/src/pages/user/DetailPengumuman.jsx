import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Calendar, User, Megaphone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DetailPengumuman = () => {
  const { id } = useParams();
  const [pengumuman, setPengumuman] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/pengumuman/${id}`)
      .then((r) => r.json())
      .then((data) => setPengumuman(data.pengumuman || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!pengumuman) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-gray-500 text-sm">Pengumuman tidak ditemukan.</p>
        <Link to="/pengumuman" className="text-blue-400 text-sm font-semibold flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-white/5">
          <Link to="/pengumuman" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          {pengumuman.penting && (
            <div className="flex items-center gap-1.5 mb-4">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wide">Pengumuman Penting</span>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">{pengumuman.judul}</h1>
          <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500/50" />
              {new Date(pengumuman.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500/50" />
              {pengumuman.authorId?.namaLengkap || pengumuman.authorId?.username || 'Admin Desa'}
            </span>
          </div>
        </header>

        <div className="px-5 md:px-0">
          <div className="p-8 md:p-12 bg-white/[0.02] border border-white/[0.04] rounded-[32px] shadow-2xl shadow-black/50">
            <p className="text-sm md:text-base text-gray-400 leading-relaxed whitespace-pre-line font-medium">{pengumuman.isi}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPengumuman;
