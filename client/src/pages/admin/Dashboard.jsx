import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import {
  FileText, ChevronRight, LogOut, CheckCircle, XCircle,
  Settings, ClipboardList
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

/**
 * Komponen Kecil untuk nampilin angka statistik (Diproses, Disetujui, dll)
 */
const StatCard = ({ icon, label, value, color }) => {
  const Icon = icon;
  return (
    <div className="p-4 rounded-xl glass-panel flex items-center gap-4 hover:border-blue-500/20 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[var(--card-bg)] flex items-center justify-center shrink-0">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ diproses: 0, disetujui: 0, ditolak: 0 });
  const [recentPengajuan, setRecentPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data statistik dan pengajuan terbaru dari server
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/pengajuan/admin/semua");
      const all = data.pengajuan || [];
      
      // Hitung manual statistiknya buat nampilin di card atas
      setStats({
        diproses: all.filter((p) => p.status === 'diproses').length,
        disetujui: all.filter((p) => p.status === 'disetujui').length,
        ditolak: all.filter((p) => p.status === 'ditolak').length,
      });

      // Ambil 5 pengajuan terakhir buat diintip di sidebar
      setRecentPengajuan(all.slice(0, 5));
    } catch (err) {
      console.error('Gagal ambil data statistik:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Keamanan: Cek apakah user sudah masuk dan beneran admin
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') {
      navigate('/dashboard'); // Tendang ke dashboard warga kalau bukan admin
      return;
    }
    fetchStats();
  }, [navigate, fetchStats]);


  // Warna-warna status biar konsisten sama halaman lain
  const statusColor = { 
    diproses: 'text-blue-400', 
    disetujui: 'text-emerald-400', 
    ditolak: 'text-red-400' 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-5 md:px-0 pt-8 md:pt-0 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Panel Kendali Admin</p>
            <h1 className="text-2xl font-black tracking-tighter uppercase">DESA DIGITAL</h1>
          </div>
        </header>

        {/* Layout Utama: Menampilkan Statistik dan Pengajuan Terbaru secara berurutan */}
        <div className="space-y-8">
          
          {/* Kartu Statistik */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Settings} label="Sedang Diproses" value={stats.diproses} color="text-blue-400" />
            <StatCard icon={CheckCircle} label="Sudah Disetujui" value={stats.disetujui} color="text-emerald-400" />
            <StatCard icon={XCircle} label="Telah Ditolak" value={stats.ditolak} color="text-red-400" />
          </div>

          {/* Daftar Pengajuan Terkini biar admin cepet tau kalau ada yang masuk */}
          <div className="p-6 glass-card rounded-[2rem] w-full shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-[var(--card-border)] pb-4">
              <h2 className="text-sm font-bold text-[var(--text)]">Pengajuan Terbaru</h2>
              <Link to="/admin/pengajuan" className="flex items-center gap-1 text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-wider group">
                Lihat Semua <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
              </div>
            ) : recentPengajuan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Belum ada pengajuan masuk hari ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPengajuan.map((p) => (
                  <div key={p._id} className="group flex items-center gap-3 p-4 glass-panel rounded-2xl transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <LetterIcon jenis={p.jenisSurat} className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-[var(--text)] group-hover:text-[var(--text)] transition-colors">{p.namaLengkap}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-0.5 tracking-tighter">
                        {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-tighter px-2 flex items-center h-6 bg-[var(--card-bg)] rounded border border-[var(--card-border)] ${statusColor[p.status]}`}>
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
