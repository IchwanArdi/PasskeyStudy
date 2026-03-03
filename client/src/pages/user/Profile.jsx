import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { isAuthenticated, clearAuth } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  Edit, Check, Lock, Shield, User, Mail, Calendar, 
  Key, Settings, Sun, Moon, LogOut, ChevronRight 
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

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi berakhir. Anda telah keluar.');
    navigate('/login');
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await userAPI.getProfile();
      const userData = profileData?.user || profileData;
      setUser(userData);
      setFormData({
        username: userData?.username || '',
        email: userData?.email || '',
      });
      const credsData = await userAPI.getCredentials();
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
      await userAPI.updateProfile(formData);
      setUser({ ...user, ...formData });
      setEditMode(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 px-6 md:px-0 transition-colors duration-300">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        <div className="mb-10 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <User className="w-3 h-3" />
            Profil Pengguna
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Pengaturan Akun</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Kelola informasi pribadi dan keamanan autentikasi Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-bold flex items-center gap-2.5">
                  <User className="w-5 h-5 text-blue-400" />
                  Informasi Akun
                </h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all border border-white/10 flex items-center gap-2">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                      <Check className="w-4 h-4" />
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({ username: user.username, email: user.email });
                      }}
                      className="px-5 py-2.5 bg-white/[0.04] text-gray-400 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2.5 text-gray-500 mb-1.5 sm:mb-0">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Username</span>
                    </div>
                    <span className="text-sm font-semibold">{user?.username}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2.5 text-gray-500 mb-1.5 sm:mb-0">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <span className="text-sm font-semibold">{user?.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
                    <div className="flex items-center gap-2.5 text-gray-500 mb-1.5 sm:mb-0">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Tanggal Dibuat</span>
                    </div>
                    <span className="text-sm font-semibold">{new Date(user?.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Credentials Card */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-base font-bold flex items-center gap-2.5 mb-8">
                <Key className="w-5 h-5 text-blue-400" />
                Kredensial Aktif
              </h2>

              {!credentials || !Array.isArray(credentials) || credentials.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <Lock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">Belum ada kunci hardware terdaftar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {credentials.map((cred, index) => (
                    <div key={index} className="p-5 glass-card rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Authenticator</p>
                          <p className="text-sm font-semibold truncate max-w-[140px]">{cred.deviceType || 'Hardware Key'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-400 block mb-0.5">Aktif</span>
                        <span className="text-xs font-mono text-gray-600">ID: {cred.credentialID?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-base font-bold flex items-center gap-2.5 mb-8">
                <Settings className="w-5 h-5 text-blue-400" />
                Pengaturan Aplikasi
              </h2>

              <div className="space-y-3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="w-full h-16 flex items-center justify-between px-4 glass-card rounded-2xl hover:bg-white/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Mode Gelap</span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{isDark ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-1 transition-all ${isDark ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>

                {/* Manage Devices Button */}
                <Link
                  to="/manage-devices"
                  className="w-full h-16 flex items-center justify-between px-4 bg-emerald-500/[0.05] border border-emerald-500/10 rounded-2xl hover:bg-emerald-500/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block text-emerald-400">Keamanan Perangkat</span>
                      <span className="text-[10px] text-emerald-500/50 font-medium uppercase tracking-wider">Kelola Kunci Keamanan</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400/30 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full h-16 flex items-center justify-between px-4 bg-red-500/[0.05] border border-red-500/10 rounded-2xl hover:bg-red-500/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block text-red-400">Keluar Sesi</span>
                      <span className="text-[10px] text-red-500/50 font-medium uppercase tracking-wider">Akhiri Akses</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/30 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-500/[0.06] border border-blue-500/15 p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-blue-400 mb-4 uppercase tracking-widest">Keamanan</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-gray-400">{credentials.length} perangkat aktif</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-medium">{credentials.length} Kunci Kriptografi</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">Status</p>
              <p className="text-sm text-gray-500 leading-relaxed italic">
                Akun dilindungi oleh WebAuthn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
