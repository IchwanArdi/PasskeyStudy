import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  Hourglass, 
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

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

const RiwayatPengaduan = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pengaduan/saya`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.pengaduan || []);
      }
    } catch (err) {
      toast.error('Gagal mengambil riwayat pengaduan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pb-24 md:pb-12 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-5 pt-12 md:pt-8">
        {/* Header */}
        <header className="mb-8 border-b border-white/5 pb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-[var(--text)] transition-colors mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">Kembali</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Laporan Saya</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Pantau perkembangan laporan fasilitas desa Anda.</p>
        </header>

        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/5 rounded-[32px] bg-white/[0.01]">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium tracking-tight">Belum ada laporan yang Anda kirimkan.</p>
            <Link to="/pengaduan/ajukan" className="inline-block mt-6 text-emerald-400 font-bold text-sm uppercase tracking-widest hover:underline">
              Kirim Laporan Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const status = statusConfig[report.status] || statusConfig.terkirim;
              const StatusIcon = status.icon;
              const imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${report.foto.replace(/\\/g, '/')}`;

              return (
                <div key={report._id} className="group bg-white/[0.02] border border-white/[0.04] rounded-[28px] overflow-hidden hover:border-emerald-500/30 transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={imageUrl} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 flex gap-2">
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <MapPin size={14} className="text-emerald-400" />
                      </div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {categoryLabels[report.kategori] || 'Laporan Umum'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-bold text-[var(--text)] line-clamp-2 leading-relaxed">
                      {report.description || report.deskripsi}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                        {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {report.catatanAdmin && (
                        <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">
                          <MessageSquare size={10} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Ada Catatan</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
           <Link 
            to="/pengaduan/ajukan" 
            className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-[24px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            + Lapor Masalah Lain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPengaduan;
