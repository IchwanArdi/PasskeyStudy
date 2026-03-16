import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import VillageCarousel from '../../components/VillageCarousel';

// Daftar jenis surat yang tersedia di aplikasi
const layananList = [
  { jenis: 'tidak_mampu', label: 'Ket. Tidak Mampu', desc: 'Keterangan ekonomi' },
  { jenis: 'kelahiran', label: 'Ket. Kelahiran', desc: 'Keterangan anak lahir' },
  { jenis: 'usaha', label: 'Ket. Usaha', desc: 'Keterangan usaha dagang' },
];

// Label dan warna status biar simpel diliatnya
const statusLabel = { diproses: 'Diproses', disetujui: 'Disetujui', ditolak: 'Ditolak' };
const statusColor = {
  diproses: 'text-blue-400',
  disetujui: 'text-emerald-400',
  ditolak: 'text-red-400',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  // Fungsi buat ambil data profil user dan riwayat surat terbaru
  const fetchData = useCallback(async () => {
    try {
      const profileData = await api.get("/user/me");
      const userData = profileData.user || profileData;
      setUser(userData);
    } catch {
      // Kalau gagal biarin aja, biasanya karena token expired
    }

    try {
      // Ambil riwayat pengajuan khusus buat user yang lagi login
      const data = await api.get("/pengajuan/saya");
      // Cukup tampilkan 3 riwayat terbaru saja biar dashboard gak kepenuhan
      setRiwayat((data.pengajuan || []).slice(0, 3));
    } catch {
      // Error riwayat gak terlalu kritis buat dashboard
    } finally {
      setLoadingRiwayat(false);
    }
  }, []);

  useEffect(() => {
    // Keamanan: Kalau belum login, tendang balik ke halaman login
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, fetchData]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pb-24 md:pb-8 transition-colors duration-300">
      {/* Bagian Atas: Sapaan buat User */}
      <header className="px-5 md:px-0 pt-12 md:pt-0 mb-4">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--card-border)]">
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest leading-none">
              Halo, {user?.username}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
              Selamat Datang di<br className="md:hidden" /> Desa Digital
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6 md:space-y-8">
          {/* Grid Menu Layanan Utama */}
          <section className="bg-white/[0.01] border border-white/[0.03] rounded-[32px] p-5 md:p-8">
            <h2 className="text-sm md:text-base font-bold mb-5">Layanan Utama</h2>
            <div className="grid grid-cols-4 gap-2 md:gap-6">
              {/* Tombol Surat Tidak Mampu */}
              <Link to="/layanan/ajukan?jenis=tidak_mampu" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-emerald-500/[0.04] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:bg-emerald-500/[0.08] transition-all shadow-inner border border-emerald-500/10">
                  <LetterIcon jenis="tidak_mampu" className="w-6 h-6 md:w-9 md:h-9 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] md:text-xs font-bold text-gray-500 group-hover:text-emerald-400 text-center leading-tight">S. Tidak Mampu</span>
              </Link>
              {/* Tombol Surat Keterangan Usaha */}
              <Link to="/layanan/ajukan?jenis=usaha" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-blue-500/[0.04] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:bg-blue-500/[0.08] transition-all shadow-inner border border-blue-500/10">
                  <LetterIcon jenis="usaha" className="w-6 h-6 md:w-9 md:h-9 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] md:text-xs font-bold text-gray-500 group-hover:text-blue-400 text-center leading-tight">S. Usaha</span>
              </Link>
              {/* Tombol Surat Keterangan Kelahiran */}
              <Link to="/layanan/ajukan?jenis=kelahiran" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-orange-500/[0.04] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:bg-orange-500/[0.08] transition-all shadow-inner border border-orange-500/10">
                  <LetterIcon jenis="kelahiran" className="w-6 h-6 md:w-9 md:h-9 text-orange-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] md:text-xs font-bold text-gray-500 group-hover:text-orange-400 text-center leading-tight">S. Kelahiran</span>
              </Link>
              {/* Tombol Detail Pengajuan (Riwayat) */}
              <Link to="/riwayat" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-purple-500/[0.04] rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:bg-purple-500/[0.08] transition-all shadow-inner border border-purple-500/10">
                  <LetterIcon jenis="riwayat" className="w-6 h-6 md:w-9 md:h-9 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] md:text-xs font-bold text-gray-500 group-hover:text-purple-400 text-center leading-tight">Detail Pengajuan</span>
              </Link>
            </div>
          </section>

          {/* Slider Foto Desa biar lebih estetik */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 min-h-[300px] md:min-h-[340px]">
            <div className="h-full">
              <VillageCarousel />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Aktivitas HP/Warga */}
        <div className="md:col-span-4 space-y-6 md:space-y-8">
          <section className="bg-white/[0.01] border border-white/[0.03] rounded-[32px] p-5 md:p-8 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none transition-all group-hover:bg-emerald-500/10" />

            <div className="flex items-center justify-between mb-5 md:mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-sm md:text-base font-bold">Aktivitas Terkini</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-xl">
                <Link to="/riwayat" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-400 font-bold uppercase tracking-wider transition-colors">
                  Surat <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {loadingRiwayat ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : riwayat.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                <div className="w-10 h-10 bg-white/[0.02] rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-[11px] md:text-xs text-gray-500 font-medium">Belum ada pengajuan surat</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 relative z-10">
                {riwayat.map((r) => {
                  const layanan = layananList.find((l) => l.jenis === r.jenisSurat);
                  return (
                    <div
                      key={r._id}
                      className="group flex flex-col p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl focus:bg-white/[0.04] hover:bg-white/[0.03] transition-colors relative overflow-hidden"
                    >
                      {/* Garis warna di pinggir buat indikator status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor[r.status]?.replace('text-', 'bg-') || 'bg-blue-400'} opacity-50`} />

                      <div className="flex items-start justify-between gap-3 font-medium mb-1.5 pl-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] md:text-sm font-bold truncate text-gray-200 group-hover:text-white transition-colors">
                            {layanan?.label || r.jenisSurat}
                          </p>
                        </div>
                        <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.03] ${statusColor[r.status]}`}>
                          {statusLabel[r.status]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 pl-2">
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
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
