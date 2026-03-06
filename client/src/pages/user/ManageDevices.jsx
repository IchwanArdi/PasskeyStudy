import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { isAuthenticated } from '../../utils/auth';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'react-toastify';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Key,
  Fingerprint,
  Calendar,
  AlertTriangle,
  Usb,
} from 'lucide-react';

const ManageDevices = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingDevice, setAddingDevice] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNickname, setEditNickname] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Pastikan user sudah login sebelum kelola perangkat
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCredentials();
  }, [navigate]);

  // Fungsi buat ngambil daftar perangkat (passkey) yang sudah terdaftar di akun ini
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getCredentials();
      const credsArray = Array.isArray(data) ? data : data?.credentials || [];
      setCredentials(credsArray);
    } catch (error) {
      toast.error('Gagal memuat daftar perangkat');
      console.error('Fetch credentials error:', error);
    } finally {
      setLoading(false);
    }
  };

  // PROSES TAMBAH PERANGKAT (Passkey Ceremony)
  const handleAddDevice = async () => {
    setAddingDevice(true);
    try {
      // Step 1: Minta opsi registrasi dari server (Challenge dll)
      const options = await userAPI.addDeviceOptions();

      // Step 2: Mulai "upacara" registrasi di browser
      // Browser akan minta sidik jari / wajah / PIN keamanan
      const credential = await startRegistration({
        ...options,
      });

      // Step 3: Kirim hasil verifikasi dari browser balik ke server buat disimpan
      await userAPI.addDeviceVerify({
        credential,
        nickname: newDeviceName.trim() || 'Perangkat Baru',
      });

      toast.success('Perangkat baru berhasil ditambahkan!');
      setShowAddModal(false);
      setNewDeviceName('');
      await fetchCredentials(); // Refresh daftar perangkat
    } catch (error) {
      // Handle error spesifik biar user gak bingung
      if (error.name === 'NotAllowedError') {
        toast.error('Gagal mendeteksi jari Anda (Dibatalkan)');
      } else if (error.name === 'InvalidStateError' || error.message?.includes('already registered')) {
        toast.info(
          'Perangkat ini sudah pernah didaftarkan sebelumnya. Anda bisa langsung masuk.'
        );
        setShowAddModal(false);
      } else {
        toast.error('Gagal menghubungkan ke perangkat');
      }
      console.error('Add device error:', error);
    } finally {
      setAddingDevice(false);
    }
  };

  // Fungsi buat hapus perangkat (hati-hati kalau cuma tinggal satu!)
  const handleDelete = async (credentialID) => {
    try {
      await userAPI.deleteCredential(credentialID);
      toast.success('Perangkat berhasil dihapus');
      setDeleteConfirmId(null);
      await fetchCredentials();
    } catch (error) {
      toast.error('Gagal menghapus perangkat');
      console.error('Delete credential error:', error);
    }
  };

  // Ubah nama panggilan perangkat biar gampang dikenali (misal: "HP Samsung Bapak")
  const handleUpdateNickname = async (credentialID) => {
    if (!editNickname.trim()) {
      toast.error('Nama perangkat tidak boleh kosong');
      return;
    }
    try {
      await userAPI.updateNickname(credentialID, editNickname.trim());
      toast.success('Nama perangkat berhasil diubah');
      setEditingId(null);
      await fetchCredentials();
    } catch (error) {
      toast.error('Gagal mengubah nama');
      console.error('Update nickname error:', error);
    }
  };

  // Logika buat nentuin icon berdasarkan jenis perangkatnya
  const getDeviceIcon = (cred) => {
    const type = cred.deviceType || '';
    if (type === 'platform') return <Fingerprint className="w-5 h-5" />; // Biometrik bawaan
    if (type === 'cross-platform') return <Key className="w-5 h-5" />; // USB Key / QR scan
    return <Shield className="w-5 h-5" />;
  };

  const getDeviceLabel = (cred) => {
    const type = cred.deviceType || '';
    if (type === 'platform') return 'Sidik Jari HP/Laptop';
    if (type === 'cross-platform') return 'Pernah Discan (QR)';
    return 'Alat Masuk';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Memuat perangkat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-8 pb-24 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Judul Halaman */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-4">
            <Shield className="w-3 h-3" />
            Bantuan Keamanan
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kelola Perangkat</h1>
          <p className="text-gray-500 text-base">
            Kelola kunci keamanan dan authenticator yang terdaftar pada akun Anda.
          </p>
        </div>

        {/* Kartu Statistik Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{credentials.length}</p>
                <p className="text-xs text-gray-500">Total Perangkat</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {credentials.filter((c) => c.deviceType === 'platform').length}
                </p>
                <p className="text-xs text-gray-500">Biometrik</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                <Usb className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {credentials.filter((c) => c.deviceType === 'cross-platform').length}
                </p>
                <p className="text-xs text-gray-500">Hardware Key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Tambah Perangkat */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold">Perangkat Terdaftar</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Tambah Perangkat
          </button>
        </div>

        {/* Baris Daftar Perangkat */}
          <div className="space-y-4">
            {credentials.map((cred, index) => (
              <div
                key={cred.credentialID || index}
                className="glass-card rounded-2xl p-6 group hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info Perangkat */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        cred.deviceType === 'platform'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                      }`}
                    >
                      {getDeviceIcon(cred)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Mode Edit Nama Perangkat */}
                      {editingId === cred.credentialID ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNickname}
                            onChange={(e) => setEditNickname(e.target.value)}
                            maxLength={50}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateNickname(cred.credentialID);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.12] rounded-lg text-sm focus:outline-none focus:border-blue-500/50 flex-1 max-w-[250px]"
                          />
                          <button
                            onClick={() => handleUpdateNickname(cred.credentialID)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-gray-500 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">
                            {cred.nickname || 'My Authenticator'}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingId(cred.credentialID);
                              setEditNickname(cred.nickname || 'My Authenticator');
                            }}
                            className="p-1 text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                            title="Ubah nama"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          cred.deviceType === 'platform' ? 'text-emerald-400' : 'text-purple-400'
                        }`}>
                          {getDeviceLabel(cred)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Waktu & Tombol Aksi */}
                  <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        Didaftarkan
                      </div>
                      <p className="text-xs font-medium">{formatDate(cred.createdAt)}</p>
                    </div>

                    {/* Tombol Hapus dengan Konfirmasi */}
                    {deleteConfirmId === cred.credentialID ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(cred.credentialID)}
                          className="px-3 py-1.5 bg-red-500/15 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/25 transition-colors"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg text-xs font-medium hover:bg-white/[0.08] transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(cred.credentialID)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus perangkat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tampilan waktu mendaftar khusus di HP (Mobile) */}
                <div className="flex gap-6 mt-4 sm:hidden">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Didaftarkan</p>
                    <p className="text-xs font-medium">{formatDate(cred.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Tips Keamanan (Footer) */}
        <div className="mt-8 bg-amber-500/[0.06] border border-amber-500/15 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Tips Keamanan</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Disarankan untuk mendaftarkan minimal 2 perangkat sebagai cadangan. Jika salah satu perangkat hilang atau rusak,
                Anda masih bisa login menggunakan perangkat lainnya. Setiap perangkat memiliki Private Key yang unik dan
                independen satu sama lain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Perangkat Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop (Latar Belakang Gelap) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !addingDevice && setShowAddModal(false)}
          />
          {/* Box Modal */}
          <div className="relative w-full max-w-md glass-card rounded-2xl p-8">
            <h2 className="text-lg font-bold mb-2">Tambah Perangkat Baru</h2>
            <p className="text-sm text-gray-500 mb-6">
              Gunakan Sidik Jari/Wajah di HP, Laptop, atau Tablet lainnya.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nama Panggilan Perangkat (Opsional)
              </label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="cth: Iphone 15, Samsung A54, Laptop, dll"
                maxLength={50}
                disabled={addingDevice}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddDevice}
                disabled={addingDevice}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {addingDevice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    Daftarkan Perangkat
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addingDevice}
                className="px-5 py-3 bg-white/[0.04] text-gray-400 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDevices;
