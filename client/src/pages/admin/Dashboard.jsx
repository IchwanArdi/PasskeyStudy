import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  FileText, Bell, Users, ChevronRight, LogOut, Clock, CheckCircle, XCircle,
  ArrowRight, Hourglass, Settings, ClipboardList
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
  const [stats, setStats] = useState({ menunggu: 0, diproses: 0, disetujui: 0, ditolak: 0 });
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
          menunggu: all.filter((p) => p.status === 'menunggu').length,
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

  const statusColor = { menunggu:'text-yellow-400', diproses:'text-blue-400', disetujui:'text-emerald-400', ditolak:'text-red-400' };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans pt-12 pb-24 px-6">
      <header className="px-5 pt-0 pb-6 flex items-start justify-between">
        <div>
          <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Panel Admin</p>
          <h1 className="text-2xl font-black">Desa Karangpucung</h1>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="px-5 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Clock} label="Menunggu" value={stats.menunggu} color="text-yellow-400" />
          <StatCard icon={Settings} label="Diproses" value={stats.diproses} color="text-blue-400" />
          <StatCard icon={CheckCircle} label="Disetujui" value={stats.disetujui} color="text-emerald-400" />
          <StatCard icon={XCircle} label="Ditolak" value={stats.ditolak} color="text-red-400" />
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Menu Admin</h2>
          <Link to="/admin/pengajuan" className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-yellow-500/20 transition-all">
            <FileText className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-bold">Kelola Pengajuan</p>
              <p className="text-xs text-gray-500">Review dan proses surat warga</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Link>
          <Link to="/admin/pengumuman" className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-blue-500/20 transition-all">
            <Bell className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-bold">Kelola Pengumuman</p>
              <p className="text-xs text-gray-500">Buat dan edit pengumuman desa</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Link>
        </div>

        {/* Recent pengajuan */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-300">Pengajuan Terbaru</h2>
            <Link to="/admin/pengajuan" className="text-xs text-red-400 font-semibold">Lihat semua</Link>
          </div>
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-white/10 border-t-red-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : recentPengajuan.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">Belum ada pengajuan.</p>
          ) : (
            <div className="space-y-2">
              {recentPengajuan.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                      <LetterIcon jenis={p.jenisSurat} className="w-5 h-5 text-gray-400" />
                    </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{p.namaLengkap}</p>
                    <p className="text-xs text-gray-600">{new Date(p.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`text-xs font-bold ${statusColor[p.status]}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
