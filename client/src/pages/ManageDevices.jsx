import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { isAuthenticated } from '../utils/auth';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Smartphone,
  Monitor,
  Key,
  Fingerprint,
  Clock,
  Calendar,
  AlertTriangle,
  Usb,
  Wifi,
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
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCredentials();
  }, [navigate]);

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

  const handleAddDevice = async () => {
    setAddingDevice(true);
    try {
      // Step 1: Get registration options
      const options = await userAPI.addDeviceOptions();

      // Step 2: Start WebAuthn registration ceremony
      const credential = await startRegistration(options);

      // Step 3: Verify and save
      await userAPI.addDeviceVerify({
        credential,
        nickname: newDeviceName.trim() || 'Perangkat Baru',
      });

      toast.success('Perangkat baru berhasil ditambahkan!');
      setShowAddModal(false);
      setNewDeviceName('');
      await fetchCredentials();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        toast.error('Registrasi dibatalkan oleh pengguna');
      } else {
        toast.error(error.response?.data?.message || 'Gagal menambahkan perangkat');
      }
      console.error('Add device error:', error);
    } finally {
      setAddingDevice(false);
    }
  };

  const handleDelete = async (credentialID) => {
    try {
      await userAPI.deleteCredential(credentialID);
      toast.success('Perangkat berhasil dihapus');
      setDeleteConfirmId(null);
      await fetchCredentials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus perangkat');
      console.error('Delete credential error:', error);
    }
  };

  const handleUpdateNickname = async (credentialID) => {
    if (!editNickname.trim()) {
      toast.error('Nama perangkat tidak boleh kosong');
      return;
    }
    try {
      await userAPI.updateNickname(credentialID, editNickname.trim());
      toast.success('Nama perangkat berhasil diperbarui');
      setEditingId(null);
      await fetchCredentials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui nama');
      console.error('Update nickname error:', error);
    }
  };

  const getDeviceIcon = (cred) => {
    const type = cred.deviceType || '';
    if (type === 'platform') return <Fingerprint className="w-5 h-5" />;
    if (type === 'cross-platform') return <Key className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const getDeviceLabel = (cred) => {
    const type = cred.deviceType || '';
    if (type === 'platform') return 'Biometrik Internal';
    if (type === 'cross-platform') return 'Kunci Hardware';
    return 'Authenticator';
  };

  const getTransportIcons = (transports) => {
    if (!transports || transports.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 mt-1">
        {transports.includes('usb') && <Usb className="w-3 h-3 text-gray-500" title="USB" />}
        {transports.includes('nfc') && <Wifi className="w-3 h-3 text-gray-500" title="NFC" />}
        {transports.includes('internal') && <Monitor className="w-3 h-3 text-gray-500" title="Internal" />}
        {transports.includes('ble') && <Smartphone className="w-3 h-3 text-gray-500" title="Bluetooth" />}
      </div>
    );
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

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Belum pernah';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Memuat perangkat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-4">
            <Shield className="w-3 h-3" />
            Manajemen Perangkat
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kelola Perangkat</h1>
          <p className="text-gray-500 text-base">
            Kelola kunci keamanan dan authenticator yang terdaftar pada akun Anda.
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Add Device Button */}
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

        {/* Devices List */}
        {credentials.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Key className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Perangkat</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tambahkan perangkat pertama Anda untuk mengamankan akun.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Tambah Perangkat Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {credentials.map((cred, index) => (
              <div
                key={cred.credentialID || index}
                className="glass-card rounded-2xl p-6 group hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Device Info */}
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
                      {/* Nickname editing */}
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
                        <span className="text-xs text-gray-600 font-mono">
                          ID: {cred.credentialID?.slice(0, 12)}...
                        </span>
                      </div>

                      {getTransportIcons(cred.transports)}
                    </div>
                  </div>

                  {/* Timestamps & Actions */}
                  <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        Didaftarkan
                      </div>
                      <p className="text-xs font-medium">{formatDate(cred.createdAt)}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3" />
                        Terakhir Dipakai
                      </div>
                      <p className="text-xs font-medium">{getTimeAgo(cred.lastUsed)}</p>
                    </div>

                    {/* Delete button */}
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

                {/* Mobile timestamps */}
                <div className="flex gap-6 mt-4 sm:hidden">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Didaftarkan</p>
                    <p className="text-xs font-medium">{formatDate(cred.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Terakhir Dipakai</p>
                    <p className="text-xs font-medium">{getTimeAgo(cred.lastUsed)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
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

      <Modal
        isOpen={showAddModal}
        onClose={() => !addingDevice && setShowAddModal(false)}
        maxWidth="max-w-md"
        title="Tambah Perangkat Baru"
        closeOnOverlayClick={!addingDevice}
        showClose={!addingDevice}
      >
        <div className="">
          <p className="text-sm text-gray-500 mb-6">
            Daftarkan authenticator baru (Touch ID, Face ID, Windows Hello, atau Security Key) ke akun Anda.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nama Perangkat (opsional)
            </label>
            <input
              type="text"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="cth: iPhone 15 Pro, Laptop Kantor, Yubikey"
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
      </Modal>
    </div>
  );
};

export default ManageDevices;
