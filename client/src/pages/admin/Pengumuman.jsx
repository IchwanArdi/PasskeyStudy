import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import { Megaphone, Trash2, Edit2, Plus, Calendar, User, Check, Bell, AlertTriangle, X, Loader, Send, Pencil, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyForm = { judul: '', isi: '', penting: false };

const AdminPengumuman = () => {
  const navigate = useNavigate();
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchPengumuman = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/pengumuman`);
      if (res.ok) { const data = await res.json(); setPengumuman(data.pengumuman || []); }
    } catch (err) {
      console.error('Failed to fetch pengumuman:', err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchPengumuman();
  }, [navigate, fetchPengumuman]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `${API_URL}/pengumuman/${editId}` : `${API_URL}/pengumuman`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editId ? 'Pengumuman diperbarui' : 'Pengumuman berhasil dibuat');
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      await fetchPengumuman();
    } catch { toast.error('Gagal menyimpan pengumuman'); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setForm({ judul: p.judul, isi: p.isi, penting: p.penting });
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pengumuman ini?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/pengumuman/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Pengumuman dihapus');
      await fetchPengumuman();
    } catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans pt-8 pb-24 md:pt-12 md:pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-2 font-medium">
              <ArrowLeft className="w-4 h-4" /> Admin Dashboard
            </Link>
            <h1 className="text-xl md:text-3xl font-black">Kelola Pengumuman</h1>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            {showForm ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="hidden md:inline">{showForm ? 'Batal' : 'Buat Baru'}</span>
            <span className="md:hidden">{showForm ? 'Batal' : 'Buat'}</span>
          </button>
        </header>

      {/* Form */}
      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="p-5 md:p-8 bg-white/[0.02] border border-blue-500/20 rounded-[2rem] space-y-5 shadow-[0_0_30px_rgba(37,99,235,0.05)]">
            <p className="text-sm md:text-base font-bold text-blue-400 flex items-center gap-2 mb-2">
              {editId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editId ? 'Edit Pengumuman' : 'Pengumuman Baru'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">Judul</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  required
                  placeholder="Judul pengumuman..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 focus:bg-white/[0.05]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">Isi</label>
                <textarea
                  value={form.isi}
                  onChange={(e) => setForm({ ...form, isi: e.target.value })}
                  required
                  rows={6}
                  placeholder="Ketik isi pengumuman di sini..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 resize-none focus:bg-white/[0.05]"
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all w-fit">
                <div
                  onClick={() => setForm({ ...form, penting: !form.penting })}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.penting ? 'bg-orange-500 border-orange-500' : 'border-white/20 bg-white/[0.04]'}`}
                >
                  {form.penting && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-300">Tandai sebagai pengumuman penting</span>
              </label>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {saving ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Publikasikan')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className={loading || pengumuman.length === 0 ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {loading ? (
          <div className="py-16 text-center lg:col-span-full"><div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin mx-auto" /></div>
        ) : pengumuman.length === 0 ? (
          <div className="lg:col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
            <Megaphone className="w-10 h-10 text-gray-600 mb-4" />
            <p className="text-gray-500 text-sm">Belum ada pengumuman. Buat yang pertama!</p>
          </div>
        ) : (
          pengumuman.map((p) => (
            <div key={p._id} className="flex flex-col justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-[24px] hover:bg-white/[0.04] transition-all group h-full">
              <div>
                {p.penting && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400 font-black mb-3 tracking-wider">
                    <Bell className="w-3 h-3" /> PENTING
                  </span>
                )}
                <h3 className="text-base font-bold text-gray-100 group-hover:text-white transition-colors leading-snug mb-2">{p.judul}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{p.isi}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
                <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-widest">{new Date(p.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                <div className="flex gap-1 border border-white/5 bg-white/[0.02] rounded-xl p-1">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    disabled={deleting === p._id}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Hapus"
                  >
                    {deleting === p._id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminPengumuman;
