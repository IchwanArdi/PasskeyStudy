import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, clearAuth, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import { useTheme } from '../../utils/useTheme';
import { 
  Edit, Check, Shield, User, Mail, Calendar, 
  Settings, Sun, Moon, LogOut, ChevronRight, HelpCircle
} from 'lucide-react';

const AdminProfile = () => {
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

  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi kelola Admin telah berakhir.');
    navigate('/login');
  };

  // Ambil data profil admin dan perangkat yang terdaftar
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await api.get("/user/me");
      const userData = profileData.user || profileData;
      setUser(userData);
      
      setFormData({
        username: userData?.username || '',
        email: userData?.email || '',
      });

      // Ambil daftar kunci keamanan (WebAuthn)
      const credsData = await api.get("/user/credentials");
      const credsArray = Array.isArray(credsData) ? credsData : credsData?.credentials || [];
      setCredentials(credsArray);
    } catch (error) {
      toast.error('Gagal memuat data profil admin');
      console.error('Profile Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Proteksi: Pastikan yang buka beneran admin
    const userStr = localStorage.getItem('user');
    const u = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || u?.role !== 'admin') {
      navigate('/dashboard');
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
      toast.success('Profil admin berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Memuat Profil Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 px-6 md:px-0 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 border-b border-[var(--card-border)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/[0.08] border border-red-500/20 rounded-full text-red-400 text-[10px] font-black uppercase tracking-wider mb-4">
            <Shield className="w-3 h-3" />
            Administrator Utama
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent uppercase">
            Pengaturan Akun
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base font-bold">Kelola informasi pribadi dan keamanan autentikasi kunci Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Kartu Informasi Akun */}
            <div className="glass-card rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 text-[var(--text-muted)]">
                  <User className="w-5 h-5 text-red-400" />
                  Identitas Admin
                </h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[var(--card-bg)] hover:opacity-80 text-[var(--text)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--card-border)] flex items-center gap-2">
                    <Edit className="w-3.5 h-3.5" /> Edit Profil
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-1">Username Baru</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-sm focus:outline-none focus:border-red-500/40 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-1">Email Baru</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-sm focus:outline-none focus:border-red-500/40 transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-500 !text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-red-500/20">
                      <Check className="w-4 h-4" /> Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({ username: user.username, email: user.email });
                      }}
                      className="px-6 py-3 bg-[var(--card-bg)] text-[var(--text-muted)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all border border-[var(--card-border)]"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Shield className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Username</span>
                    </div>
                    <span className="text-sm font-bold">{user?.username}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Mail className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Email Terdaftar</span>
                    </div>
                    <span className="text-sm font-bold">{user?.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5">
                    <div className="flex items-center gap-2.5 text-[var(--text-muted)] mb-1.5 sm:mb-0">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bergabung Sejak</span>
                    </div>
                    <span className="text-sm font-bold">{new Date(user?.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Pengaturan Tambahan */}
            <div className="glass-card rounded-[2rem] p-8">
              <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 mb-8 text-[var(--text-muted)]">
                <Settings className="w-5 h-5 text-red-400" />
                Preferensi & Keamanan
              </h2>

              <div className="space-y-4">
                {/* Switcher Mode Gelap */}
                <button
                  onClick={toggleTheme}
                  className="w-full h-20 flex items-center justify-between px-6 rounded-[24px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-inner">
                      {isDark ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black block">Visual Tema Gelap</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{isDark ? 'Saat ini: Aktif' : 'Saat ini: Nonaktif'}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-all ${isDark ? 'bg-red-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>

                {/* Link ke Panduan */}
                <Link
                  to="/admin/panduan"
                  className="w-full h-20 flex items-center justify-between px-6 rounded-[24px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black block">Panduan Admin</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tata cara pengelolaan surat</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/30 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Link Kelola Perangkat */}
                <Link
                  to="/admin/manage-devices"
                  className="w-full h-20 flex items-center justify-between px-6 rounded-[24px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black block">Keamanan Kunci Perangkat</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Daftar kunci biometrik aktif</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400/30 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Tombol Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full h-20 flex items-center justify-between px-6 rounded-[24px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <LogOut className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black block">Keluar Kelola</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tutup sesi administrasi</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/30 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Status Keamanan */}
          <div className="space-y-6">
            <div className="bg-red-500/[0.04] border border-red-500/10 p-7 rounded-[2rem]">
              <h3 className="text-[10px] font-black text-red-400 mb-5 uppercase tracking-widest border-b border-red-400/10 pb-2">Status Proteksi</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-muted)]">{credentials.length} Kunci Terdaftar</span>
                </div>
                <div className="p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter leading-relaxed">
                    Akun administrator Anda terlindungi oleh autentikasi biometrik standar industri (WebAuthn).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-[2rem] border border-[var(--card-border)] bg-[var(--card-bg)]">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Informasi Sistem</p>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Segala perubahan informasi admin akan dicatat dalam log sistem desa untuk keperluan audit keamanan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
