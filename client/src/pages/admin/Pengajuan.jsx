import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  ArrowLeft, ChevronDown, ChevronUp, Check, X, RefreshCw,
  Settings, Clock
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jenisLabel = { domisili: 'Domisili', tidak_mampu: 'Tidak Mampu', kelahiran: 'Kelahiran', kematian: 'Kematian', usaha: 'Usaha' };
const statusConfig = {
  menunggu: { label: 'Menunggu', color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' },
  diproses: { label: 'Diproses', color: 'text-blue-400 border-blue-400/20 bg-blue-400/10' },
  disetujui: { label: 'Disetujui', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' },
  ditolak: { label: 'Ditolak', color: 'text-red-400 border-red-400/20 bg-red-400/10' },
};

const AdminPengajuan = () => {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchPengajuan();
  }, [navigate, fetchPengajuan]);

  const fetchPengajuan = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `${API_URL}/pengajuan/admin/semua?status=${filterStatus}`
        : `${API_URL}/pengajuan/admin/semua`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) { const data = await res.json(); setPengajuan(data.pengajuan || []); }
    } catch (err) {
      console.error('Failed to fetch pengajuan:', err);
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchPengajuan(); }, [fetchPengajuan]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/pengajuan/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status, catatanAdmin: catatan }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Pengajuan ${statusConfig[status].label.toLowerCase()}`);
      setCatatan('');
      setExpanded(null);
      await fetchPengajuan();
    } catch { toast.error('Gagal mengupdate status'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans pb-24">
      <header className="px-5 pt-12 pb-4">
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">Kelola Pengajuan</h1>
          <button onClick={fetchPengajuan} className="p-2 text-gray-500 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Filter */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {['', 'menunggu', 'diproses', 'disetujui', 'ditolak'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 transition-all ${
              filterStatus === s
                ? 'bg-white text-black border-white'
                : 'text-gray-400 border-white/10 hover:border-white/20'
            }`}
          >
            {s === '' ? 'Semua' : statusConfig[s].label}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : pengajuan.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-16">Tidak ada pengajuan.</p>
        ) : (
          pengajuan.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.menunggu;
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : p._id)} className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center shrink-0">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.namaLengkap}</p>
                    <p className="text-xs text-gray-500 truncate">{jenisLabel[p.jenisSurat] || p.jenisSurat} · {new Date(p.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">
                    {/* Detail */}
                    {[
                      { l: 'NIK', v: p.nik },
                      { l: 'Tempat, Tgl Lahir', v: `${p.tempatLahir}, ${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}` },
                      { l: 'Alamat', v: p.alamat },
                      { l: 'Keperluan', v: p.keperluan },
                    ].map((item) => (
                      <div key={item.l} className="flex justify-between gap-4">
                        <span className="text-xs text-gray-500 shrink-0">{item.l}</span>
                        <span className="text-xs text-right font-medium">{item.v}</span>
                      </div>
                    ))}

                    {/* Catatan admin */}
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Catatan untuk warga (opsional)..."
                      rows={2}
                      className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs focus:outline-none focus:border-blue-500/40 transition-all resize-none placeholder:text-gray-600 mt-2"
                    />

                    {/* Action buttons */}
                    {p.status !== 'disetujui' && p.status !== 'ditolak' && (
                      <div className="flex gap-2">
                        <button
                          disabled={updating === p._id}
                          onClick={() => updateStatus(p._id, 'diproses')}
                          className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        >
                          <Settings className="w-3 h-3" /> Proses
                        </button>
                        <button
                          disabled={updating === p._id}
                          onClick={() => updateStatus(p._id, 'disetujui')}
                          className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Setujui
                        </button>
                        <button
                          disabled={updating === p._id}
                          onClick={() => updateStatus(p._id, 'ditolak')}
                          className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    )}
                    {(p.status === 'disetujui' || p.status === 'ditolak') && (
                      <p className="text-xs text-center text-gray-600 py-2">Pengajuan sudah final.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPengajuan;
