import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { pengajuanAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ChevronDown, FileText, Calendar, User, MapPin, Clock, CheckCircle, XCircle, Hourglass, Info, DownloadCloud, Trash2 } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jenisList = {
  domisili: { label: 'Surat Domisili' },
  tidak_mampu: { label: 'Ket. Tidak Mampu' },
  kelahiran: { label: 'Ket. Kelahiran' },
  kematian: { label: 'Ket. Kematian' },
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
  const [expandedId, setExpandedId] = useState(null);
  const [filterJenis, setFilterJenis] = useState('semua');
  const [deletingId, setDeletingId] = useState(null);

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

  const [downloadingId, setDownloadingId] = useState(null);

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
    if (!window.confirm('Yakin ingin menghapus riwayat pengajuan ini secara permanen?')) return;
    try {
      setDeletingId(id);
      await pengajuanAPI.deletePengajuan(id);
      toast.success('Pengajuan berhasil dihapus');
      setPengajuan(prev => prev.filter(p => p._id !== id));
      if (expandedId === id) setExpandedId(null);
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Riwayat Pengajuan</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Daftar permohonan surat Anda.</p>
          </div>

          {/* New Simplified Dropdown Filter */}
          <div className="relative group min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 ml-1">Filter Jenis Surat</label>
            <div className="relative">
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                <option value="semua" className="bg-[#0a0a0c]">Semua Jenis Surat</option>
                {Object.entries(jenisList).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-[#0a0a0c]">
                    {cfg.label}
                  </option>
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
            <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/5 rounded-[32px]">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {pengajuan.length === 0 ? 'Belum ada pengajuan surat.' : 'Tidak ada pengajuan yang cocok dengan filter.'}
            </p>
            {pengajuan.length > 0 && (
              <button 
                onClick={() => { setFilterJenis('semua'); }}
                className="mt-4 text-xs text-emerald-400 font-bold uppercase"
              >
                Reset Filter
              </button>
            )}
            {pengajuan.length === 0 && (
              <Link to="/layanan" className="inline-block mt-4 px-6 py-3 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all">
                Ajukan Sekarang
              </Link>
            )}
          </div>
        ) : (
          filteredData.map((p) => {
            const info = jenisList[p.jenisSurat] || { label: p.jenisSurat };
            const status = statusConfig[p.status] || statusConfig.diproses;
            const StatusIcon = status.Icon;
            const isExpanded = expandedId === p._id;

            return (
              <div key={p._id} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p._id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center shrink-0">
                    <LetterIcon jenis={p.jenisSurat} className="w-6 h-6 text-emerald-400/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate tracking-tight">{info.label}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter mt-1">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-gray-700 shrink-0" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-white/[0.02] space-y-3">
                    <div className="pt-4 grid grid-cols-1 gap-3">
                      {[
                        { label: 'Nama Lengkap', value: p.namaLengkap, icon: User },
                        { label: 'NIK', value: p.nik, icon: FileText },
                        { label: 'Tempat, Tgl Lahir', value: `${p.tempatLahir}, ${new Date(p.tanggalLahir).toLocaleDateString('id-ID')}`, icon: Calendar },
                        { label: 'Alamat', value: p.alamat, icon: MapPin },
                        { label: 'Keperluan', value: p.keperluan, icon: Info },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.02]">
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest block mb-1">{item.label}</span>
                          <span className="text-xs font-medium text-gray-300">{item.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                    {p.catatanAdmin && (
                      <div className="mt-2 p-4 bg-blue-500/[0.03] border border-blue-500/10 rounded-2xl">
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Catatan Petugas</p>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">{p.catatanAdmin}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                      {p.status === 'disetujui' && (
                        <button
                          onClick={() => handleDownloadPDF(p._id, p.jenisSurat, p.nik)}
                          disabled={downloadingId === p._id || deletingId === p._id}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-black rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <DownloadCloud className="w-4 h-4" />
                          {downloadingId === p._id ? 'Mengunduh...' : 'Download Surat (PDF)'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id || downloadingId === p._id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === p._id ? 'Menghapus...' : 'Hapus Riwayat'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 md:px-0 mt-8">
        <Link to="/layanan" className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center text-sm hover:bg-emerald-500/20 transition-all uppercase tracking-widest">
          + Ajukan Surat Baru
        </Link>
      </div>
      </div>
    </div>
  );
};

export default RiwayatPengajuan;
