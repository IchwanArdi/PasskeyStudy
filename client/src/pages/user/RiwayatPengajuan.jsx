import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  FileText, Clock, CheckCircle2, XCircle, Trash2, 
  Search, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const RiwayatPengajuan = () => {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fungsi buat ngambil data riwayat pengajuan si user
  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const data = await api.get("/pengajuan/saya");
      const list = data?.pengajuan || data || [];
      setPengajuan(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error('Gagal mengambil data riwayat');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    fetchRiwayat();
  }, [navigate]);

  // Fungsi buat download PDF surat yang sudah di-ACC
  const handleDownloadPDF = async (e, id, jenis, nik) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      const token = localStorage.getItem("token");
      const apiUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pengajuan/${id}/pdf`;
      
      const res = await fetch(apiUrl, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeJenis = jenis.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `Surat_${safeJenis}_${nik || 'Warga'}.pdf`);
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

  // Fungsi hapus pengajuan
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin membatalkan pengajuan ini?')) return;
    try {
      await api.delete(`/pengajuan/${id}`);
      toast.success('Pengajuan berhasil dibatalkan');
      fetchRiwayat();
    } catch (error) {
      toast.error('Gagal membatalkan pengajuan');
      console.error('Delete error:', error);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'disetujui':
        return { label: 'Disetujui', color: 'text-[var(--success)]', bg: 'bg-[var(--success-subtle)]', icon: CheckCircle2 };
      case 'ditolak':
        return { label: 'Ditolak', color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-subtle)]', icon: XCircle };
      default:
        return { label: 'Diproses', color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-subtle)]', icon: Clock };
    }
  };

  const filteredPengajuan = (Array.isArray(pengajuan) ? pengajuan : [])
    .filter(p => filter === 'semua' || p.jenisSurat === filter)
    .filter(p => p.keperluan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.jenisSurat?.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return 'Tanggal tidak valid';
      return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Tanggal error'; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-[var(--text-muted)]">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-5 md:px-0">
        {/* Header */}
        <header className="pt-0 pb-6 mb-8 border-b border-[var(--section-border)]">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">Pantauan Layanan</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Riwayat Pengajuan</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Lacak status surat-surat yang sedang atau pernah Anda ajukan.</p>
        </header>

        {/* Pencarian & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder="Cari pengajuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary-hover)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['semua', 'tidak_mampu', 'kelahiran', 'usaha'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  filter === t 
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md' 
                    : 'bg-[var(--bg-raised)] border-[var(--border)] hover:border-[var(--primary-border)] hover:bg-[var(--bg-overlay)]'
                }`}
              >
                {t === 'semua' ? 'Semua' : t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tampilan List Pengajuan */}
        {filteredPengajuan.length > 0 ? (
          <div className="space-y-4">
            {filteredPengajuan.map((item) => {
              const status = getStatusInfo(item.status);
              const isExpanded = expandedId === item._id;
              
              return (
                <div
                  key={item._id}
                  className={`bg-[var(--bg-raised)] rounded-2xl overflow-hidden transition-all border ${isExpanded ? 'border-[var(--primary-hover)] shadow-md' : 'border-[var(--border)] hover:border-[var(--primary-border)] hover:bg-[var(--bg-overlay)]'}`}
                >
                  {/* Header Card */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    className="p-5 md:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center shrink-0 border border-[var(--primary-border)]">
                        <LetterIcon jenis={item.jenisSurat} className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-[var(--text)] truncate">
                          {item.jenisSurat?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] max-w-sm line-clamp-1">{item.keperluan || 'Tanpa keterangan tambahan'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--section-border)] pt-4 sm:pt-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Tgl Ajukan</div>
                        <p className="text-xs font-bold text-[var(--text-muted)] italic">{formatDate(item.createdAt)}</p>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${status.bg} ${status.color} shrink-0`}>
                        <status.icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">{status.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-[var(--section-border)] animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-overlay)] rounded-2xl p-5 border border-[var(--border)]">
                        {/* Kolom 1: Data Utama */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest border-b border-[var(--primary-border)] pb-2">Data Pemohon</h4>
                          <div className="space-y-2.5">
                            {[
                              { label: 'Nama Lengkap', value: item.namaLengkap },
                              { label: 'NIK', value: item.nik },
                              { label: 'Tempat Lahir', value: item.tempatLahir },
                              { label: 'Tanggal Lahir', value: formatDate(item.tanggalLahir) },
                              { label: 'Alamat KTP', value: item.alamat },
                            ].map((info) => (
                              <div key={info.label} className="flex justify-between items-start gap-4">
                                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{info.label}</span>
                                <span className="text-xs font-bold text-[var(--text)] text-right">{info.value || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Kolom 2: Info Surat & Tindakan */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest border-b border-[var(--primary-border)] pb-2">Detail Pengajuan</h4>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Keperluan</span>
                              <span className="text-xs font-bold text-[var(--text)] text-right italic">"{item.keperluan}"</span>
                            </div>
                            
                            {item.dataTambahan && Object.entries(item.dataTambahan).map(([key, value]) => {
                              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              return (
                                <div key={key} className="flex justify-between items-start gap-4">
                                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{label}</span>
                                  <span className="text-xs font-bold text-[var(--primary)] text-right">{String(value)}</span>
                                </div>
                              );
                            })}

                            {item.catatanAdmin && (
                              <div className="mt-4 p-3 bg-[var(--bg-raised)] border border-[var(--primary-border)] rounded-xl">
                                <p className="text-[10px] font-bold text-[var(--primary)] uppercase mb-1">Catatan Admin:</p>
                                <p className="text-xs text-[var(--text)] italic">{item.catatanAdmin}</p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--section-border)] mt-4">
                            {item.status === 'disetujui' && (
                              <button
                                onClick={(e) => handleDownloadPDF(e, item._id, item.jenisSurat, item.nik)}
                                disabled={downloadingId === item._id}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                              >
                                {downloadingId === item._id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                Unduh Surat (PDF)
                              </button>
                            )}

                            <button
                              onClick={(e) => handleDelete(e, item._id)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus Pengajuan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-[var(--bg-raised)] rounded-3xl border-dashed border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--bg-overlay)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-muted)] mb-1">Belum ada riwayat</h3>
            <p className="text-sm text-[var(--text-muted)]">Surat yang Anda ajukan akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatPengajuan;
