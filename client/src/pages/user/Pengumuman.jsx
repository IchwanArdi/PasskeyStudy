import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Pengumuman = () => {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/pengumuman`)
      .then((r) => r.json())
      .then((data) => setPengumuman(data.pengumuman || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-white/5">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-2">Pusat Informasi</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Pengumuman</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Informasi dan berita terbaru seputar Desa Karangpucung.</p>
        </header>

        <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : pengumuman.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-white/5 rounded-[32px]">
              <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Belum ada pengumuman hari ini.</p>
            </div>
          ) : (
            pengumuman.map((p) => (
              <Link
                key={p._id}
                to={`/pengumuman/${p._id}`}
                className="flex flex-col p-6 md:p-8 bg-white/[0.02] border border-white/[0.04] rounded-[32px] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all group"
              >
                {p.penting && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Kabar Penting</span>
                  </div>
                )}
                <h2 className="text-lg font-bold leading-tight mb-3 group-hover:text-blue-300 transition-colors">{p.judul}</h2>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-6 font-medium">{p.isi}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Pengumuman;
