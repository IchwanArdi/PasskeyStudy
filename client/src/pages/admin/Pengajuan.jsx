import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  ArrowLeft, ChevronDown, ChevronUp, Check, X, RefreshCw,
  Filter, DownloadCloud, Trash2
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import { Link } from 'react-router-dom';
import { pengajuanAPI } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jenisLabel = { tidak_mampu: 'Tidak Mampu', kelahiran: 'Kelahiran', usaha: 'Usaha' };
const statusConfig = {
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
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [catatan, setCatatan] = useState('');

  const handleDownloadPDF = async (id, jenis, nik) => {
    try {
      setDownloadingId(id);
      const res = await pengajuanAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      const safeJenis = jenis.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `Surat_${safeJenis}_${nik}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Surat PDF berhasil diunduh!');
    } catch (error) {
      toast.error('Gagal mengunduh surat PDF');
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchPengajuan = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `${API_URL}/pengajuan/admin?status=${filterStatus}`
        : `${API_URL}/pengajuan/admin`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) { const data = await res.json(); setPengajuan(data.pengajuan || []); }
    } catch (err) {
      console.error('Failed to fetch pengajuan:', err);
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchPengajuan();
  }, [navigate, fetchPengajuan]);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengajuan ini selamanya? (Aksi ini tidak bisa dibatalkan)')) return;
    try {
      setDeletingId(id);
      await pengajuanAPI.deletePengajuan(id);
      toast.success('Pengajuan berhasil dihapus dari sistem');
      setPengajuan(prev => prev.filter(p => p._id !== id));
      if (expanded === id) setExpanded(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-2 font-medium">
              <ArrowLeft className="w-4 h-4" /> Admin Dashboard
            </Link>
            <h1 className="text-xl md:text-3xl font-black">Kelola Pengajuan</h1>
          </div>
          <button onClick={fetchPengajuan} className="p-2.5 md:p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

      {/* Filter */}
        <div className="relative w-full max-w-xs md:max-w-sm mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 text-sm font-semibold rounded-xl appearance-none bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all cursor-pointer shadow-sm hover:border-white/20"
          >
            {[
              { val: '', label: 'Semua Status' },
              { val: 'diproses', label: 'Diproses' },
              { val: 'disetujui', label: 'Disetujui' },
              { val: 'ditolak', label: 'Ditolak' }
            ].map((opt) => (
              <option key={opt.val} value={opt.val} className="bg-[#111] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : pengajuan.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-16">Tidak ada pengajuan.</p>
        ) : (
          pengajuan.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.diproses;
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] overflow-hidden transition-all hover:bg-white/[0.03]">
                <button onClick={() => setExpanded(isOpen ? null : p._id)} className="w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 text-left">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center shrink-0">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold truncate text-gray-200">{p.namaLengkap}</p>
                    <p className="text-xs md:text-sm text-gray-500 truncate mt-0.5">{jenisLabel[p.jenisSurat] || p.jenisSurat} · {new Date(p.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                  </div>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${sc.color}`}>{sc.label}</span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center ml-2 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/[0.03] pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-white/[0.01] p-4 rounded-2xl border border-white/[0.02]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Detail Pengajuan</h3>
                        {[
                          { l: 'NIK', v: p.nik },
                          { l: 'Tempat, Tgl Lahir', v: `${p.tempatLahir}, ${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}` },
                          { l: 'Alamat', v: p.alamat },
                          { l: 'Keperluan', v: p.keperluan },
                        ].map((item) => (
                          <div key={item.l} className="flex justify-between gap-4">
                            <span className="text-xs md:text-sm text-gray-500 shrink-0">{item.l}</span>
                            <span className="text-xs md:text-sm text-right font-medium text-gray-300">{item.v}</span>
                          </div>
                        ))}
                        
                        {p.dataTambahan && Object.keys(p.dataTambahan).length > 0 && (
                           <>
                             <div className="border-t border-white/[0.05] my-2 pt-2"></div>
                             {Object.entries(p.dataTambahan).map(([key, value]) => {
                               const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                               return (
                                <div key={key} className="flex justify-between gap-4 mt-2">
                                  <span className="text-xs md:text-sm text-emerald-500/80 shrink-0">{formattedLabel}</span>
                                  <span className="text-xs md:text-sm text-right font-medium text-emerald-400">{String(value)}</span>
                                </div>
                               );
                             })}
                           </>
                        )}
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tindakan Admin</h3>
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Catatan untuk pemohon (ditampilkan di riwayat)..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:border-blue-500/40 transition-all resize-none placeholder:text-gray-600"
                        />

                        {p.status !== 'disetujui' && p.status !== 'ditolak' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={updating === p._id}
                              onClick={() => updateStatus(p._id, 'disetujui')}
                              className="flex-1 min-w-[100px] py-2.5 md:py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" /> Setujui
                            </button>
                            <button
                              disabled={updating === p._id}
                              onClick={() => updateStatus(p._id, 'ditolak')}
                              className="flex-1 min-w-[100px] py-2.5 md:py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" /> Tolak
                            </button>
                          </div>
                        )}
                        {(p.status === 'disetujui' || p.status === 'ditolak') && (
                          <div className="space-y-3">
                            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-center">
                              <p className="text-xs text-gray-500 font-medium">Pengajuan sudah bersifat final.</p>
                            </div>
                            
                            {p.status === 'disetujui' && (
                              <button
                                onClick={() => handleDownloadPDF(p._id, p.jenisSurat, p.nik)}
                                disabled={downloadingId === p._id || deletingId === p._id}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                              >
                                <DownloadCloud className="w-4 h-4" />
                                {downloadingId === p._id ? 'Mengunduh...' : 'Unduh Surat Modal (PDF)'}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(p._id)}
                              disabled={deletingId === p._id || downloadingId === p._id}
                              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingId === p._id ? 'Menghapus...' : 'Hapus Permanen'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminPengajuan;
