import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import { Users, ShieldCheck, Mail, Search, RefreshCw, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('semua');
  const [emergencyResult, setEmergencyResult] = useState(null); // { username, code }

  // Ambil semua daftar user dari server (khusus admin)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/admin/semua`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Proteksi lapis admin: Cek login dan role
    const userStr = localStorage.getItem('user');
    const u = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || u?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [navigate, fetchUsers]);



  // Fungsi buat bikin kode darurat untuk warga
  const handleGenerateEmergencyCode = async (userId, name) => {
    if (!window.confirm(`kode darurat untuk ${name}? Gunakan jika warga benar-benar kehilangan akses.`)) return;
    setUpdatingId(userId);
    setEmergencyResult(null);
    try {
      const res = await fetch(`${API_URL}/recovery/admin/emergency-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmergencyResult({ username: data.username, code: data.code });
      toast.success(`Kode darurat untuk ${name} berhasil dibuat!`);
    } catch {
      toast.error('Gagal membuat kode darurat');
    } finally {
      setUpdatingId(null);
    }
  };

  // Logika filter: Gabungkan pencarian teks dan filter role
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const searchMatch = (u.username && u.username.toLowerCase().includes(term)) || 
                        (u.email && u.email.toLowerCase().includes(term));
    const roleMatch = roleFilter === 'semua' || u.role === roleFilter;
    
    return searchMatch && roleMatch;
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6 px-5 md:px-0 pt-8 md:pt-0 pb-24 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>

          <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mb-2">Manajemen Pengguna</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Daftar Warga Desa</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Pilih Role (Filter) */}
          <div className="relative w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer hover:bg-[var(--card-bg-hover)]"
            >
              <option value="semua">Tampilkan Semua</option>
              <option value="admin">Khusus Admin</option>
              <option value="warga">Khusus Warga</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Kotak Pencarian */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-sm text-[var(--text)] focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          
          {/* Tombol Refresh */}
          <button 
            onClick={fetchUsers} 
            title="Muat ulang data"
            className="w-full sm:w-auto p-2.5 flex-shrink-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg-hover)] transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Tampilan Hasil Kode Darurat */}
      {emergencyResult && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Kode Darurat Dibuat!</p>
              <p className="text-sm text-[var(--text-muted)]">Berikan kode ini ke <b className="text-[var(--text)]">{emergencyResult.username}</b></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl font-mono text-2xl font-black tracking-[0.5em] text-[var(--text)]">
              {emergencyResult.code}
            </div>
            <button 
              onClick={() => setEmergencyResult(null)}
              className="p-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Tabel Data User */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-xs text-gray-500 font-medium">Kosong nih, gak ada user yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Identitas Pengguna</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Hak Akses</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Tindakan Tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black shrink-0 border border-blue-500/10 shadow-inner">
                          {u.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">{u.username}</p>
                          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-black uppercase tracking-wider rounded-lg">
                          <ShieldCheck className="w-3 h-3" /> Admin Utama
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-wider rounded-lg">
                          Warga Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Kode Darurat (Selalu ada buat Admin bantu Warga) */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleGenerateEmergencyCode(u._id, u.username)}
                            disabled={updatingId === u._id}
                            className={`inline-flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50`}
                            title="Generate kode pemulihan darurat"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${updatingId === u._id ? 'animate-spin' : ''}`} />
                            Darurat
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
