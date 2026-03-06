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

// Pengaturan warna dan label untuk setiap status pengajuan
const statusConfig = {
  diproses: { label: 'Diproses', color: 'text-blue-400 border-blue-400/20 bg-blue-400/10' },
  disetujui: { label: 'Disetujui', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' },
  ditolak: { label: 'Ditolak', color: 'text-red-400 border-red-400/20 bg-red-400/10' },
};

const AdminPengajuan = () => {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // ID pengajuan yang sedang dibuka detailnya
  const [filterStatus, setFilterStatus] = useState(''); // Filter berdasarkan status (diproses/disetujui/ditolak)
  const [updating, setUpdating] = useState(null); // ID pengajuan yang sedang diupdate statusnya
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [catatan, setCatatan] = useState(''); // Catatan admin saat ACC/Tolak

  // Fungsi buat unduh surat PDF (khusus yang sudah disetujui)
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

  // Ambil daftar pengajuan warga dari server
  const fetchPengajuan = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `${API_URL}/pengajuan/admin?status=${filterStatus}`
        : `${API_URL}/pengajuan/admin`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      
      if (res.ok) { 
        const data = await res.json(); 
        setPengajuan(data.pengajuan || []); 
      }
    } catch (err) {
      console.error('Gagal ambil data pengajuan:', err);
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    // Proteksi: Cek apakah user admin
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!isAuthenticated() || user?.role !== 'admin') { 
      navigate('/dashboard'); 
      return; 
    }
    fetchPengajuan();
  }, [navigate, fetchPengajuan]);

  // Update status pengajuan (Setujui atau Tolak)
  const updateStatus = async (id, status) => {
    if (!catatan.trim() && status === 'ditolak') {
      return toast.warning('Mohon isi catatan alasan penolakan.');
    }

    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/pengajuan/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status, catatanAdmin: catatan }),
      });
      
      if (!res.ok) throw new Error();
      
      toast.success(`Pengajuan berhasil ${statusConfig[status].label.toLowerCase()}`);
      setCatatan('');
      setExpanded(null);
      await fetchPengajuan(); // Refresh list
    } catch { 
      toast.error('Waduh, gagal update statusnya'); 
    } finally { 
      setUpdating(null); 
    }
  };

  // Hapus permanen pengajuan dari database
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengajuan ini selamanya? (Tidak bisa dibatalkan)')) return;
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
            <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest mb-2">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Panel
            </Link>
            <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">Kelola Pengajuan Surat</h1>
          </div>
          <button 
            onClick={fetchPengajuan} 
            title="Refresh Data"
            className="p-2.5 md:p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Bagian Filter Status */}
        <div className="relative w-full max-w-xs md:max-w-sm ml-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 text-xs font-black uppercase tracking-widest rounded-2xl appearance-none bg-white/[0.04] border border-white/10 text-gray-300 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all cursor-pointer shadow-sm"
          >
            <option value="" className="bg-[#111] text-white">Tampilkan Semua Status</option>
            <option value="diproses" className="bg-[#111] text-white">Hanya Diproses</option>
            <option value="disetujui" className="bg-[#111] text-white">Sudah Disetujui</option>
            <option value="ditolak" className="bg-[#111] text-white">Telah Ditolak</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Daftar Kartu Pengajuan */}
        <div className="space-y-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : pengajuan.length === 0 ? (
          <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Kosong nih, gak ada pengajuan.</p>
          </div>
        ) : (
          pengajuan.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.diproses;
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className={`bg-white/[0.02] border transition-all rounded-[28px] overflow-hidden ${isOpen ? 'border-blue-500/40 bg-white/[0.04]' : 'border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10'}`}>
                <button onClick={() => setExpanded(isOpen ? null : p._id)} className="w-full flex items-center gap-3 md:gap-4 p-4 md:p-6 text-left">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 md:w-8 md:h-8 text-blue-400/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-lg font-black truncate text-gray-100 italic tracking-tight">{p.namaLengkap}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      {jenisLabel[p.jenisSurat] || p.jenisSurat} • {new Date(p.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </p>
                  </div>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${sc.color} shrink-0`}>{sc.label}</span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center ml-2 shrink-0 border border-white/5">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Bagian Detail yang kebuka pas kartunya diklik */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-white/[0.03] pt-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Data Lengkap Pemohon */}
                      <div className="space-y-4 bg-white/[0.02] p-5 rounded-3xl border border-white/[0.04]">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Informasi Detail Warga</h3>
                        {[
                          { l: 'NIK PEMOHON', v: p.nik },
                          { l: 'TTL', v: `${p.tempatLahir}, ${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}` },
                          { l: 'ALAMAT DOMISILI', v: p.alamat },
                          { l: 'KEPERLUAN SURAT', v: p.keperluan },
                        ].map((item) => (
                          <div key={item.l} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-600 tracking-tighter">{item.l}</span>
                            <span className="text-xs md:text-sm font-bold text-gray-300 italic">{item.v}</span>
                          </div>
                        ))}
                        
                        {/* Jika ada data tambahan (form dinamis lahir/usaha) */}
                        {p.dataTambahan && Object.keys(p.dataTambahan).length > 0 && (
                           <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                             {Object.entries(p.dataTambahan).map(([key, value]) => {
                               const formattedLabel = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                               return (
                                <div key={key} className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-emerald-500/60 tracking-tighter">{formattedLabel}</span>
                                  <span className="text-xs md:text-sm font-bold text-emerald-400 italic font-mono">{String(value)}</span>
                                </div>
                               );
                             })}
                           </div>
                        )}
                      </div>

                      {/* Kontrol Admin (ACC/Tolak/Download) */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Keputusan & Catatan Admin</h3>
                          <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Tulis alasan disetujui atau ditolak di sini..."
                            rows={4}
                            className="w-full px-5 py-4 bg-white/[0.02] border border-white/[0.06] rounded-[24px] text-sm focus:outline-none focus:border-blue-500/40 transition-all resize-none placeholder:text-gray-700 italic"
                          />
                        </div>

                        {/* Tombol Aksi per Status */}
                        {p.status === 'diproses' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              disabled={updating === p._id}
                              onClick={() => updateStatus(p._id, 'disetujui')}
                              className="py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" /> Setujui
                            </button>
                            <button
                              disabled={updating === p._id}
                              onClick={() => updateStatus(p._id, 'ditolak')}
                              className="py-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" /> Tolak
                            </button>
                          </div>
                        )}

                        {(p.status === 'disetujui' || p.status === 'ditolak') && (
                          <div className="space-y-4">
                            <div className="py-3 px-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-center">
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Status Pengajuan: {p.status}</p>
                            </div>
                            
                            {p.status === 'disetujui' && (
                              <button
                                onClick={() => handleDownloadPDF(p._id, p.jenisSurat, p.nik)}
                                disabled={downloadingId === p._id || deletingId === p._id}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-50"
                              >
                                {downloadingId === p._id ? (
                                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                ) : (
                                  <DownloadCloud className="w-5 h-5" />
                                )}
                                Unduh Draft Surat (PDF)
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(p._id)}
                              disabled={deletingId === p._id || downloadingId === p._id}
                              className="w-full flex items-center justify-center gap-2 py-3 text-red-500/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> Hapus Permanen
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
