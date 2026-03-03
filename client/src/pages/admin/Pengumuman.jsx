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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchPengumuman();
  }, [navigate, fetchPengumuman]);

  const fetchPengumuman = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/pengumuman`);
      if (res.ok) { const data = await res.json(); setPengumuman(data.pengumuman || []); }
    } catch (err) {
      console.error('Failed to fetch pengumuman:', err);
    } finally { setLoading(false); }
  }, []);

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
    <div className="min-h-screen bg-[#050508] text-white font-sans pb-24">
      <header className="px-5 pt-12 pb-4">
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">Kelola Pengumuman</h1>
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-400 transition-all"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Batal' : 'Buat Baru'}
          </button>
        </div>
      </header>

      {/* Form */}
      {showForm && (
        <div className="px-5 mb-6">
          <form onSubmit={handleSubmit} className="p-5 bg-white/[0.03] border border-blue-500/20 rounded-2xl space-y-4">
            <p className="text-sm font-bold text-blue-400 flex items-center gap-2">
              {editId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editId ? 'Edit Pengumuman' : 'Pengumuman Baru'}
            </p>
            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">Judul</label>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
                placeholder="Judul pengumuman..."
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">Isi</label>
              <textarea
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                required
                rows={5}
                placeholder="Isi pengumuman..."
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-gray-600 resize-none"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, penting: !form.penting })}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.penting ? 'bg-orange-500 border-orange-500' : 'border-white/20 bg-white/[0.04]'}`}
              >
                {form.penting && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-300">Tandai sebagai penting</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-all disabled:opacity-60"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Publikasikan')}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="px-5 space-y-3">
        {loading ? (
          <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin mx-auto" /></div>
        ) : pengumuman.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-16">Belum ada pengumuman. Buat yang pertama!</p>
        ) : (
          pengumuman.map((p) => (
            <div key={p._id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              {p.penting && (
                <span className="text-xs text-orange-400 font-bold flex items-center gap-1">
                  <Bell className="w-3 h-3" /> PENTING · 
                </span>
              )}
              <p className="text-sm font-bold mt-0.5">{p.judul}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.isi}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">{new Date(p.tanggal).toLocaleDateString('id-ID')}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    disabled={deleting === p._id}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deleting === p._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPengumuman;
