import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import VillageCarousel from '../../components/VillageCarousel';

// Daftar jenis surat yang tersedia di aplikasi
const layananList = [
  { jenis: 'tidak_mampu', label: 'Ket. Tidak Mampu', desc: 'Keterangan ekonomi' },
];

// Label dan warna status biar simpel diliatnya
const statusLabel = { diproses: 'Diproses', disetujui: 'Disetujui', ditolak: 'Ditolak' };
const statusColor = {
  disetujui: 'text-[var(--success)]',
  ditolak: 'text-[var(--danger)]',
  diproses: 'text-[var(--warning)]',
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
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border)]">
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
          {/* Banner Layanan Utama (SKTM) */}
          <Link to="/layanan/ajukan?jenis=tidak_mampu" className="block relative bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 rounded-3xl p-6 md:p-8 overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 backdrop-blur-md border border-white/20">Layanan Utama</span>
                <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">Surat Keterangan<br />Tidak Mampu (SKTM)</h2>
                <p className="text-sm text-emerald-50 md:max-w-xs leading-relaxed">Ajukan permohonan SKTM dengan mudah dan cepat tanpa perlu antre di balai desa.</p>
              </div>
              <div className="hidden sm:flex w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <LetterIcon jenis="tidak_mampu" className="w-8 h-8 text-white" />
              </div>
            </div>
          </Link>

          {/* Slider Foto Desa biar lebih estetik */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 min-h-[300px] md:min-h-[340px]">
            <div className="h-full">
              <VillageCarousel />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Aktivitas HP/Warga */}
        <div className="md:col-span-4 space-y-6 md:space-y-8">
          <section className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-3xl p-5 md:p-8 h-full flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-5 md:mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-sm md:text-base font-bold">Aktivitas Terkini</h2>
              </div>
            </div>

            {loadingRiwayat ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : riwayat.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-overlay)]">
                <div className="w-10 h-10 bg-[var(--bg-raised)] border border-[var(--border)] rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Belum ada pengajuan surat</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 relative z-10">
                {riwayat.map((r) => {
                  const layanan = layananList.find((l) => l.jenis === r.jenisSurat);
                  return (
                    <div
                      key={r._id}
                      className="group flex flex-col p-4 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-hover)] transition-colors relative overflow-hidden"
                    >
                      {/* Garis warna di pinggir buat indikator status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor[r.status]?.replace('text-', 'bg-') || 'bg-[var(--border)]'}`} />

                      <div className="flex items-start justify-between gap-3 font-medium mb-1.5 pl-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-[var(--text)] transition-colors">
                            {layanan?.label || r.jenisSurat}
                          </p>
                        </div>
                        <div className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-raised)] border border-[var(--border)] ${statusColor[r.status]}`}>
                          {statusLabel[r.status]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 pl-2">
                        <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
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
