import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  FileText, Bell, Users, ChevronRight, LogOut, Clock, CheckCircle, XCircle,
  ArrowRight, Hourglass, Settings, ClipboardList, ShieldAlert
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ icon, label, value, color }) => {
  const Icon = icon;
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/pengajuan/admin/semua`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        const all = data.pengajuan || [];
        setStats({
          diproses: all.filter((p) => p.status === 'diproses').length,
          disetujui: all.filter((p) => p.status === 'disetujui').length,
          ditolak: all.filter((p) => p.status === 'ditolak').length,
        });
        setRecentPengajuan(all.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    const fetchStatsInternal = async () => {
      await fetchStats();
    };
    fetchStatsInternal();
  }, [navigate, fetchStats]);

  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi berakhir.');
    navigate('/login');
  };

  const statusColor = { diproses:'text-blue-400', disetujui:'text-emerald-400', ditolak:'text-red-400' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Panel Admin</p>
          <h1 className="text-2xl font-black">Desa Karangpucung</h1>
        </div>
          <button onClick={handleLogout} className="p-2.5 md:p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </button>
      </header>

        {/* Menu & Stats Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Stats & Menu) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Settings} label="Diproses" value={stats.diproses} color="text-blue-400" />
              <StatCard icon={CheckCircle} label="Disetujui" value={stats.disetujui} color="text-emerald-400" />
              <StatCard icon={XCircle} label="Ditolak" value={stats.ditolak} color="text-red-400" />
            </div>

            {/* Menu */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Akses Cepat Admin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/admin/pengajuan" className="flex items-center gap-4 p-5 md:p-6 bg-white/[0.03] border border-white/[0.06] rounded-3xl hover:border-yellow-500/20 hover:bg-white/[0.05] transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-bold text-gray-200 group-hover:text-white transition-colors">Kelola Pengajuan</p>
                    <p className="text-xs text-gray-500 mt-1">Review dan proses surat warga</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/admin/pengumuman" className="flex items-center gap-4 p-5 md:p-6 bg-white/[0.03] border border-white/[0.06] rounded-3xl hover:border-blue-500/20 hover:bg-white/[0.05] transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-bold text-gray-200 group-hover:text-white transition-colors">Kelola Pengumuman</p>
                    <p className="text-xs text-gray-500 mt-1">Buat dan edit pengumuman desa</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/admin/pengaduan" className="flex items-center gap-4 p-5 md:p-6 bg-white/[0.03] border border-white/[0.06] rounded-3xl hover:border-red-500/20 hover:bg-white/[0.05] transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-bold text-gray-200 group-hover:text-white transition-colors">Kelola Pengaduan</p>
                    <p className="text-xs text-gray-500 mt-1">Tinjau laporan anonim warga</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Area (Recent Pengajuan) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-[2rem] h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-300">Pengajuan Terbaru</h2>
                <Link to="/admin/pengajuan" className="text-xs text-red-400 font-bold hover:text-red-300 transition-colors uppercase tracking-wider">Lihat semua</Link>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-red-400 rounded-full animate-spin" />
                </div>
              ) : recentPengajuan.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Belum ada pengajuan masuk.</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {recentPengajuan.map((p) => (
                    <div key={p._id} className="group flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:bg-white/[0.04] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <LetterIcon jenis={p.jenisSurat} className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-gray-200 group-hover:text-white transition-colors">{p.namaLengkap}</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5 tracking-tighter">{new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-tighter ${statusColor[p.status]}`}>
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
    </div>
  );
};

export default AdminDashboard;
