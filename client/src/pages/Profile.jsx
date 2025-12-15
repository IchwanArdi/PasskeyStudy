import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { isAuthenticated, clearAuth } from '../utils/auth';
import { toast } from 'react-toastify';
import { Search, Github, Edit, Check, Lock, Shield } from 'lucide-react';

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

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const [userResponse, credentialsResponse] = await Promise.all([userAPI.getProfile(), userAPI.getCredentials()]);
      setUser(userResponse.data);
      setCredentials(credentialsResponse.data);
      setFormData({
        username: userResponse.data.username,
        email: userResponse.data.email,
      });
    } catch (error) {
      toast.error('Gagal memuat profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(formData);
      toast.success('Profil berhasil diperbarui');
      setEditMode(false);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
    toast.info('Berhasil logout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white font-semibold text-sm hover:text-gray-300 transition-colors">
              WebAuthn Research
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
              Dokumentasi
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:border-gray-700 transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
              <span className="ml-1.5 px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl K</span>
            </div>
            <a href="#" className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-all" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all">
              Dashboard
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profil</h1>
            <p className="text-gray-400">Kelola informasi profil dan kredensial WebAuthn Anda</p>
          </div>

          {/* User Information Section */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 mb-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Informasi Pengguna</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={30}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan email"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        username: user.username,
                        email: user.email,
                      });
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Username</span>
                  <span className="text-white font-medium">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">Member sejak</span>
                  <span className="text-white font-medium">{new Date(user?.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>

          {/* WebAuthn Credentials Section */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
            <h2 className="text-xl font-semibold mb-6">Kredensial WebAuthn</h2>
            {credentials.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Belum ada kredensial WebAuthn yang terdaftar</p>
                <p className="text-sm text-gray-500">Anda dapat mendaftarkan kredensial WebAuthn saat login atau registrasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((cred, index) => (
                  <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{cred.deviceType || 'Unknown Device'}</h3>
                          <p className="text-sm text-gray-400">Terdaftar: {new Date(cred.createdAt).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          {cred.counter !== undefined && <p className="text-xs text-gray-500 mt-1">Counter: {cred.counter}</p>}
                        </div>
                      </div>
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

export default Profile;
