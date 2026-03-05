import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Hourglass, 
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { toast } from 'react-toastify';

const categoryLabels = {
  jalan_rusak: 'Jalan Rusak',
  sampah_lingkungan: 'Sampah & Lingkungan',
  lampu_jalan: 'Lampu Jalan',
  fasilitas_umum: 'Fasilitas Umum',
};

const statusConfig = {
  terkirim: { label: 'Terkirim', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock },
  diproses: { label: 'Diproses', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: Hourglass },
  selesai: { label: 'Selesai', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
};

const AdminPengaduan = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pengaduan/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.pengaduan || []);
      }
    } catch (err) {
      toast.error('Gagal mengambil data pengaduan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pengaduan/${selectedReport._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus, catatanAdmin: adminNote })
      });

      if (res.ok) {
        toast.success('Laporan berhasil diperbarui');
        setSelectedReport(null);
        fetchReports();
      } else {
        toast.error('Gagal memperbarui laporan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Kelola Pengaduan</h1>
        </div>
        <p className="text-gray-500 font-medium">Moderasi dan tindak lanjuti laporan anonim dari warga.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/5 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[32px] p-20 text-center">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Belum ada pengaduan masuk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const status = statusConfig[report.status] || statusConfig.terkirim;
            const imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${report.foto?.replace(/\\/g, '/')}`;
            
            return (
              <div key={report._id} className="bg-white/[0.02] border border-white/[0.05] rounded-[28px] overflow-hidden flex flex-col hover:border-red-500/20 transition-all group">
                <div className="relative aspect-video overflow-hidden">
                   <img src={imageUrl} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${status.color}`}>
                        {status.label}
                      </div>
                   </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {categoryLabels[report.kategori] || 'Laporan'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[var(--text)] line-clamp-3 leading-relaxed mb-6">
                    {report.deskripsi}
                  </p>

                  <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString('id-ID')}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedReport(report);
                        setNewStatus(report.status);
                        setAdminNote(report.catatanAdmin || '');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Update <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pb-24 md:pb-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
          <div className="relative w-full max-w-xl bg-[#121214] border border-white/10 rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Edit3 size={20} className="text-red-500" />
                  Update Status Laporan
                </h3>

                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Status Baru</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => setNewStatus(key)}
                            className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                              newStatus === key 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20'
                            }`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Catatan Admin</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Berikan keterangan tindak lanjut..."
                        className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all resize-none"
                      />
                   </div>

                   <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 py-4 bg-white/[0.05] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.1] transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-2 py-4 bg-red-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {updating ? 'Memperbarui...' : 'Simpan Perubahan'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPengaduan;
