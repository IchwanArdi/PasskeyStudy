import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { userAPI } from '../../services/api';
import {
  FileText, Bell, Key, ChevronRight,
  Clock, CheckCircle, XCircle, Hourglass, User,
  Megaphone, Folder
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const layananList = [
  { jenis: 'domisili', label: 'Surat Domisili', desc: 'Keterangan tempat tinggal' },
  { jenis: 'tidak_mampu', label: 'Ket. Tidak Mampu', desc: 'Keterangan ekonomi' },
  { jenis: 'kelahiran', label: 'Ket. Kelahiran', desc: 'Keterangan anak lahir' },
  { jenis: 'kematian', label: 'Ket. Kematian', desc: 'Keterangan anggota wafat' },
  { jenis: 'usaha', label: 'Ket. Usaha', desc: 'Keterangan usaha dagang' },
];

const StatusIcon = ({ status }) => {
  if (status === 'disetujui') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'ditolak') return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === 'diproses') return <Hourglass className="w-4 h-4 text-blue-400" />;
  return <Clock className="w-4 h-4 text-yellow-400" />;
};

const statusLabel = { menunggu: 'Menunggu', diproses: 'Diproses', disetujui: 'Disetujui', ditolak: 'Ditolak' };
const statusColor = {
  menunggu: 'text-yellow-400',
  diproses: 'text-blue-400',
  disetujui: 'text-emerald-400',
  ditolak: 'text-red-400',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const profileData = await userAPI.getProfile();
      const userData = profileData?.user || profileData;
      setUser(userData);
    } catch {
      // profil gagal – sudah ada auth guard di App.jsx
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pengajuan/saya`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setRiwayat((data.pengajuan || []).slice(0, 3));
      }
    } catch {
      // tidak kritis
    } finally {
      setLoadingRiwayat(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, fetchData]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pb-24 md:pb-8 transition-colors duration-300">
      {/* Header */}
      <header className="px-5 md:px-0 pt-12 md:pt-0 pb-6 mb-4">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.04]">
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest leading-none">
              Halo, {user?.username || 'Warga'}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              Selamat Datang di<br className="md:hidden" /> Desa Karangpucung
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3 p-2 px-4 glass-card rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
              {user?.username?.substring(0, 2) || 'W'}
            </div>
            <span className="text-sm font-semibold">{user?.username || 'Warga'}</span>
          </div>
        </div>
      </header>

      <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column (Main Stats & Actions) */}
        <div className="md:col-span-8 space-y-8">
          {/* Quick links - Redesigned to be compact on mobile */}
          <section>
            <div className="grid grid-cols-3 gap-3 md:gap-8">
              {/* Ajukan Surat */}
              <Link to="/layanan" className="flex flex-col items-center group">
                <div className="w-full aspect-square md:aspect-auto md:h-32 glass-card rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center gap-2 md:gap-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all active:scale-95">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <span className="text-[10px] md:text-sm font-bold text-gray-500 group-hover:text-white transition-colors">Ajukan Surat</span>
                </div>
              </Link>

              {/* Berita Desa */}
              <Link to="/pengumuman" className="flex flex-col items-center group">
                <div className="w-full aspect-square md:aspect-auto md:h-32 glass-card rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center gap-2 md:gap-4 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all active:scale-95">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Megaphone className="w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <span className="text-[10px] md:text-sm font-bold text-gray-500 group-hover:text-white transition-colors">Berita Desa</span>
                </div>
              </Link>

              {/* Riwayat Anda */}
              <Link to="/riwayat" className="flex flex-col items-center group">
                <div className="w-full aspect-square md:aspect-auto md:h-32 glass-card rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center gap-2 md:gap-4 hover:border-violet-500/30 hover:bg-violet-500/[0.02] transition-all active:scale-95">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-violet-400/20 to-violet-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <span className="text-[10px] md:text-sm font-bold text-gray-500 group-hover:text-white transition-colors">Riwayat Anda</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Layanan surat */}
          <section className="glass-panel p-6 md:p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Layanan Mandiri</h2>
                <p className="text-xs text-gray-500">Pilih jenis surat yang ingin diajukan</p>
              </div>
              <Link to="/layanan" className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {layananList.slice(0, 4).map((l) => (
                <Link
                  key={l.jenis}
                  to={`/layanan/ajukan?jenis=${l.jenis}`}
                  className="flex items-center gap-4 p-4 md:p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LetterIcon jenis={l.jenis} className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{l.label}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">{l.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Notifications/Status) */}
        <div className="md:col-span-4 space-y-8">
          {/* Riwayat terbaru */}
          <section className="glass-panel p-6 md:p-8 rounded-[32px] h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm md:text-base font-bold text-white">Update Terkini</h2>
              <Link to="/riwayat" className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase border border-emerald-400/20 px-2 py-1 rounded">
                AKTIVITAS
              </Link>
            </div>

            {loadingRiwayat ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : riwayat.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/5 rounded-2xl">
                <div className="w-12 h-12 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Belum ada pengajuan</p>
                <Link to="/layanan" className="text-emerald-400 text-xs font-bold mt-4 px-4 py-2 bg-emerald-400/5 rounded-lg border border-emerald-400/10">
                  Buat Pengajuan
                </Link>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {riwayat.map((r) => {
                  const layanan = layananList.find((l) => l.jenis === r.jenisSurat);
                  return (
                    <div
                      key={r._id}
                      className="group flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="mt-1">
                        <StatusIcon status={r.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate group-hover:text-emerald-400 transition-colors">
                          {layanan?.label || r.jenisSurat}
                        </p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5 tracking-tighter">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-tighter ${statusColor[r.status]}`}>
                        {statusLabel[r.status]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
