import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, clearAuth, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import { useTheme } from '../../utils/useTheme';
import { 
  Check, Shield, User, Mail, Calendar, 
  Key, Settings, Sun, Moon, LogOut, ChevronRight, HelpCircle
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  // Gunakan hook terpusat — tidak ada duplikasi logika tema
  const { isDark, toggleTheme } = useTheme();

  // Fungsi keluar aplikasi, hapus token dan balikin ke login
  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi berakhir. Anda telah keluar.');
    navigate('/login');
  };

  // Ambil data profil user dan jumlah perangkat keamanan yang terdaftar
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await api.get("/user/me");
      const userData = profileData?.user || profileData;
      setUser(userData);
      setFormData({
        username: userData?.username || '',
        email: userData?.email || '',
      });
      // Ambil daftar perangkat buat kasih info status keamanan
      const credsData = await api.get("/user/credentials");
      const credsArray = Array.isArray(credsData) ? credsData : credsData?.credentials || [];
      setCredentials(credsArray);
    } catch (error) {
      toast.error('Gagal memuat data profil');
      console.error('Profile Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Keamanan: Cek apakah user berhak buka halaman ini
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [navigate, fetchProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/user/me", formData);
      setUser({ ...user, ...formData });
      setEditMode(false);
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-[var(--text-muted)]">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 px-6 md:px-0 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header Halaman */}
        <div className="mb-10 border-b border-[var(--card-border)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <User className="w-3 h-3" />
            Profil Pengguna
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Pengaturan Akun</h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base font-medium">Kelola informasi pribadi dan keamanan autentikasi Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Kartu Informasi Akun */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-bold flex items-center gap-2.5">
                  <User className="w-5 h-5 text-blue-400" />
                  Informasi Akun
                </h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[var(--card-bg)] hover:opacity-80 text-[var(--text)] rounded-xl text-sm font-medium transition-all border border-[var(--card-border)] flex items-center gap-2">
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 !text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                      <Check className="w-4 h-4" />
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({ username: user.username, email: user.email });
                      }}
                      className="px-5 py-2.5 bg-[var(--card-bg)] text-[var(--text-muted)] rounded-xl text-sm font-medium hover:opacity-80 transition-all border border-[var(--card-border)]"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Username</span>
                    </div>
                    <span className="text-sm font-semibold">{user?.username}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <span className="text-sm font-semibold">{user?.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Tanggal Dibuat</span>
                    </div>
                    <span className="text-sm font-semibold">{new Date(user?.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bagian Pengaturan & Navigasi */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-base font-bold flex items-center gap-2.5 mb-8">
                <Settings className="w-5 h-5 text-blue-400" />
                Pengaturan Aplikasi
              </h2>

              <div className="space-y-3">
                {/* Switcher Mode Gelap */}
                <button
                  onClick={toggleTheme}
                  className="w-full h-16 flex items-center justify-between px-4 glass-card rounded-2xl hover:bg-[var(--card-bg)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Mode Gelap</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{isDark ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-1 transition-all ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>

                {/* Link ke Panduan */}
                <Link
                  to="/panduan"
                  className="w-full h-16 flex items-center justify-between px-4 rounded-2xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Panduan & FAQ</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Cara Penggunaan Aplikasi</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400/30 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Kelola Perangkat (WebAuthn) */}
                <Link
                  to="/manage-devices"
                  className="w-full h-16 flex items-center justify-between px-4 rounded-2xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Keamanan Perangkat</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Kelola Kunci Keamanan</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400/30 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Tombol Keluar */}
                <button
                  onClick={handleLogout}
                  className="w-full h-16 flex items-center justify-between px-4 border border-red-500/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Keluar</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Akhiri Akses</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/30 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info Keamanan */}
          <div className="space-y-6">
            <div className="bg-blue-500/[0.06] border border-blue-500/15 p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-blue-400 mb-4 uppercase tracking-widest">Keamanan</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-[var(--text-muted)]">{credentials.length} perangkat aktif</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-medium">{credentials.length} Kunci Kriptografi</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Status</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">
                Akun dilindungi kunci biometrik (Login Tanpa Password).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
