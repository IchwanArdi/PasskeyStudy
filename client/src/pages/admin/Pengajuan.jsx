import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  ArrowLeft, ChevronDown, ChevronUp, Check, X, RefreshCw,
  Filter, DownloadCloud, Trash2
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import { Link } from 'react-router-dom';

const jenisLabel = { tidak_mampu: 'Tidak Mampu' };

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
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pengajuan/${id}/pdf`;
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
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
        ? `/pengajuan/admin/semua?status=${filterStatus}`
        : `/pengajuan/admin/semua`;
      
      const data = await api.get(url);
      setPengajuan(data.pengajuan || []);
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
      await api.patch(`/pengajuan/${id}/status`, { 
        status, 
        catatanAdmin: catatan 
      });
      
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
      await api.delete(`/pengajuan/${id}`);
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
    <div className="space-y-6 animate-in fade-in duration-500 px-5 md:px-0 pt-8 md:pt-0 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mb-2">Pusat Kelola Layanan</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Kelola Pengajuan Surat</h1>
          </div>
          <button 
            onClick={fetchPengajuan} 
            title="Refresh Data"
            className="p-2.5 md:p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] transition-all flex items-center justify-center shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Bagian Filter Status */}
        <div className="relative w-full max-w-xs md:max-w-sm ml-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 text-xs font-semibold tracking-widest rounded-2xl appearance-none glass-panel text-[var(--text)] focus:outline-none focus:border-blue-500/40 transition-all cursor-pointer shadow-sm"
          >
            <option value="">Tampilkan Semua Status</option>
            <option value="diproses">Hanya Diproses</option>
            <option value="disetujui">Sudah Disetujui</option>
            <option value="ditolak">Telah Ditolak</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-muted)]">
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
          <div className="py-24 text-center bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] rounded-[2.5rem]">
            <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Kosong nih, gak ada pengajuan.</p>
          </div>
        ) : (
          pengajuan.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.diproses;
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className={`glass-card border transition-all rounded-[28px] overflow-hidden ${isOpen ? 'border-blue-500/40' : 'hover:border-white/10'}`}>
                <button onClick={() => setExpanded(isOpen ? null : p._id)} className="w-full flex items-center gap-3 md:gap-4 p-4 md:p-6 text-left">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--card-bg)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--card-border)]">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 md:w-8 md:h-8 text-blue-400/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-lg font-black truncate text-[var(--text)] tracking-tight">{p.namaLengkap}</p>
                    <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">
                      {jenisLabel[p.jenisSurat] || p.jenisSurat} • {new Date(p.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </p>
                  </div>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${sc.color} shrink-0`}>{sc.label}</span>
                  <div className="w-8 h-8 rounded-full bg-[var(--card-bg)] flex items-center justify-center ml-2 shrink-0 border border-[var(--card-border)]">
                     {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                  </div>
                </button>

                {/* Bagian Detail yang kebuka pas kartunya diklik */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-white/[0.03] pt-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Data Lengkap Pemohon */}
                      <div className="space-y-4 glass-panel p-5 rounded-3xl">
                        {[
                          { l: 'NIK PEMOHON', v: p.nik },
                          { l: 'TTL', v: `${p.tempatLahir}, ${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}` },
                          { l: 'ALAMAT DOMISILI', v: p.alamat },
                          { l: 'KEPERLUAN SURAT', v: p.keperluan },
                          { l: 'PENGHASILAN PER BULAN', v: `Rp ${Number(p.penghasilan || 0).toLocaleString('id-ID')}` },
                          { l: 'JUMLAH TANGGUNGAN', v: `${p.jumlahTanggungan || 0} Orang` },
                        ].map((item) => (
                          <div key={item.l} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-[var(--text-muted)] tracking-tighter">{item.l}</span>
                            <span className="text-xs md:text-sm font-bold text-[var(--text)]">{item.v}</span>
                          </div>
                        ))}

                        {p.dokumenPengantar && (
                          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                            <button
                              onClick={() => {
                                const newWindow = window.open();
                                if (newWindow) {
                                  newWindow.document.write(`<iframe src="${p.dokumenPengantar}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                  newWindow.document.title = `Dokumen_${p.namaLengkap}`;
                                } else {
                                  toast.error('Pop-up terblokir, silakan izinkan pop-up untuk melihat dokumen.');
                                }
                              }}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                            >
                              <DownloadCloud className="w-4 h-4" /> Lihat Dokumen Pengantar
                            </button>
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
                            className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[24px] text-sm focus:outline-none focus:border-blue-500/40 transition-all resize-none placeholder:text-[var(--text-muted)] text-[var(--text)]"
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
                            <div className="py-3 px-4 glass-panel rounded-2xl text-center">
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
                              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
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
