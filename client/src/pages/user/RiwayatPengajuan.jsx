import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { pengajuanAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ChevronDown, FileText, Calendar, User, MapPin, Clock, CheckCircle, XCircle, Hourglass, Info, DownloadCloud, Trash2 } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jenisList = {
  tidak_mampu: { label: 'Ket. Tidak Mampu' },
  kelahiran: { label: 'Ket. Kelahiran' },
  usaha: { label: 'Ket. Usaha' },
};

const statusConfig = {
  diproses: { label: 'Diproses', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', Icon: Hourglass },
  disetujui: { label: 'Disetujui', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', Icon: CheckCircle },
  ditolak: { label: 'Ditolak', color: 'text-red-400 bg-red-400/10 border-red-400/20', Icon: XCircle },
};

const RiwayatPengajuan = () => {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [filterJenis, setFilterJenis] = useState('semua');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    fetchRiwayat();
  }, [navigate]);

  const fetchRiwayat = async () => {
    try {
      const res = await fetch(`${API_URL}/pengajuan/saya`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPengajuan(data.pengajuan || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pengajuan.filter((p) => {
    return filterJenis === 'semua' || p.jenisSurat === filterJenis;
  });

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

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await pengajuanAPI.deletePengajuan(id);
      toast.success('Pengajuan berhasil dihapus');
      setPengajuan(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="px-5 md:px-0 pt-0 pb-6 mb-4 border-b border-white/5 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">SmartWarga</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--text)] to-gray-500 bg-clip-text text-transparent">Riwayat Pengajuan</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Daftar permohonan surat Anda.</p>
          </div>

          <div className="relative group min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Filter Jenis Surat</label>
            <div className="relative">
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full appearance-none bg-black text-white border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                <option value="semua" className="bg-black text-white">Semua Jenis Surat</option>
                {Object.entries(jenisList).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-black text-white">{cfg.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        <div className="px-5 md:px-0 mt-8 space-y-4">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[var(--text)]/10 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[var(--text)]/5 rounded-[32px]">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {pengajuan.length === 0 ? 'Belum ada pengajuan surat.' : 'Tidak ada pengajuan yang cocok dengan filter.'}
            </p>
          </div>
        ) : (
          filteredData.map((p) => {
            const info = jenisList[p.jenisSurat] || { label: p.jenisSurat };
            const status = statusConfig[p.status] || statusConfig.diproses;
            const StatusIcon = status.Icon;

            return (
              <div key={p._id} className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/[0.05] dark:border-white/[0.04] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group">
                <button
                  onClick={() => setSelectedPengajuan(p)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-12 h-12 bg-emerald-500/[0.05] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate tracking-tight">{info.label}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 md:px-0 mt-8">
        <Link to="/layanan" className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center text-sm hover:bg-emerald-500/20 transition-all uppercase tracking-widest">
          Ajukan Surat Baru
        </Link>
      </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedPengajuan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPengajuan(null)}
          />
          
          {/* Content */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
              {/* Header Modal */}
              <div className="p-6 md:p-8 flex items-start justify-between border-b border-black/5 dark:border-white/5 sticky top-0 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <LetterIcon jenis={selectedPengajuan.jenisSurat} className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">Detail Pengajuan</h2>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">{jenisList[selectedPengajuan.jenisSurat]?.label || selectedPengajuan.jenisSurat}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPengajuan(null)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Data Content */}
              <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Nama Lengkap', value: selectedPengajuan.namaLengkap, icon: User },
                    { label: 'NIK', value: selectedPengajuan.nik, icon: FileText },
                    { label: 'Tempat, Tgl Lahir', value: `${selectedPengajuan.tempatLahir}, ${new Date(selectedPengajuan.tanggalLahir).toLocaleDateString('id-ID')}`, icon: Calendar },
                    { label: 'Alamat', value: selectedPengajuan.alamat, icon: MapPin },
                    { label: 'Keperluan', value: selectedPengajuan.keperluan, icon: Info },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Data Tambahan Section */}
                {selectedPengajuan.dataTambahan && Object.keys(selectedPengajuan.dataTambahan).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Data Spesifik Layanan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedPengajuan.dataTambahan).map(([key, value]) => {
                        const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key} className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-4 rounded-2xl border border-emerald-500/10">
                            <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest block mb-2">{formattedLabel}</span>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status & Action */}
                <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status Saat Ini</p>
                      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusConfig[selectedPengajuan.status]?.color}`}>
                        {selectedPengajuan.status}
                      </div>
                    </div>
                    {selectedPengajuan.catatanAdmin && (
                      <div className="max-w-[60%] text-right text-xs text-gray-500 italic">
                        "{selectedPengajuan.catatanAdmin}"
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {selectedPengajuan.status === 'disetujui' && (
                      <button
                        onClick={() => handleDownloadPDF(selectedPengajuan._id, selectedPengajuan.jenisSurat, selectedPengajuan.nik)}
                        disabled={downloadingId === selectedPengajuan._id}
                        className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-black rounded-[20px] text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <DownloadCloud className="w-5 h-5" />
                        {downloadingId === selectedPengajuan._id ? 'Mengunduh...' : 'Download PDF'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus riwayat ini secara permanen?')) {
                          handleDelete(selectedPengajuan._id);
                          setSelectedPengajuan(null);
                        }
                      }}
                      disabled={deletingId === selectedPengajuan._id}
                      className="flex items-center justify-center gap-2 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      Hapus Riwayat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatPengajuan;

