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
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const u = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || u?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [navigate, fetchUsers]);

  const handleMakeAdmin = async (userId, name) => {
    if (!window.confirm(`Yakin ingin menjadikan ${name} sebagai Admin?`)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API_URL}/user/admin/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ userId, role: 'admin' }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${name} sekarang adalah Admin`);
      await fetchUsers();
    } catch {
      toast.error('Gagal mengubah role user');
    } finally {
      setUpdatingId(null);
    }
  };

  const [roleFilter, setRoleFilter] = useState('semua');

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const searchMatch = (u.username && u.username.toLowerCase().includes(term)) || 
                        (u.email && u.email.toLowerCase().includes(term));
    const roleMatch = roleFilter === 'semua' || u.role === roleFilter;
    
    return searchMatch && roleMatch;
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Manajemen Pengguna</p>
          <h1 className="text-2xl md:text-3xl font-black">Daftar Warga</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Role Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-sm font-semibold text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer hover:bg-white/[0.06]"
            >
              <option value="semua" className="bg-[#0a0a0c]">Semua Role</option>
              <option value="admin" className="bg-[#0a0a0c]">Admin</option>
              <option value="warga" className="bg-[#0a0a0c]">Warga</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-500"
            />
          </div>
          
          <button onClick={fetchUsers} className="w-full sm:w-auto p-2.5 flex-shrink-0 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/[0.04] rounded-[2rem] overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada data pengguna ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Pengguna</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                          {u.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-200">{u.username}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          Warga
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleMakeAdmin(u._id, u.username)}
                          disabled={updatingId === u._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {updatingId === u._id ? 'Proses...' : 'Jadikan Admin'}
                        </button>
                      )}
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
