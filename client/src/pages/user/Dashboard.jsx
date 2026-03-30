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
          {/* Grid Menu Layanan Utama */}
          <section className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-3xl p-5 md:p-8">
            <h2 className="text-sm md:text-base font-bold mb-5">Layanan Utama</h2>
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              {/* Tombol Surat Tidak Mampu */}
              <Link to="/layanan/ajukan?jenis=tidak_mampu" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:border-[var(--border-hover)] transition-all shadow-sm">
                  <LetterIcon jenis="tidak_mampu" className="w-6 h-6 md:w-9 md:h-9 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] text-center leading-tight">S. Tidak Mampu</span>
              </Link>
              {/* Tombol Surat Keterangan Usaha */}
              <Link to="/layanan/ajukan?jenis=usaha" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:border-[var(--border-hover)] transition-all shadow-sm">
                  <LetterIcon jenis="usaha" className="w-6 h-6 md:w-9 md:h-9 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] text-center leading-tight">S. Usaha</span>
              </Link>
              {/* Tombol Surat Keterangan Kelahiran */}
              <Link to="/layanan/ajukan?jenis=kelahiran" className="flex flex-col items-center group">
                <div className="w-[50px] h-[50px] md:w-20 md:h-20 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-3 group-hover:-translate-y-1 group-hover:border-[var(--border-hover)] transition-all shadow-sm">
                  <LetterIcon jenis="kelahiran" className="w-6 h-6 md:w-9 md:h-9 text-orange-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] text-center leading-tight">S. Kelahiran</span>
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
