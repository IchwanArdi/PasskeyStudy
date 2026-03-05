import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Camera, 
  Send, 
  AlertCircle, 
  MapPin, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

const categories = [
  { id: 'jalan_rusak', label: 'Jalan Rusak', icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'sampah_lingkungan', label: 'Sampah & Lingkungan', icon: AlertCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'lampu_jalan', label: 'Lampu Jalan', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'fasilitas_umum', label: 'Fasilitas Umum', icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

const FormPengaduan = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !description || !image) {
      toast.error('Mohon lengkapi semua data dan lampirkan foto');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('kategori', selectedCategory);
    formData.append('deskripsi', description);
    formData.append('foto', image);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pengaduan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Gagal mengirim pengaduan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pb-24 md:pb-12 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto px-5 pt-12 md:pt-8">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[var(--text)] transition-colors mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">Kembali</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-3">
                <ShieldAlert size={12} className="text-red-400" />
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Otomatis Anonim</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Pengaduan Warga</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Sampaikan laporan Anda dengan aman dan rahasia.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection Dropdown */}
          <section>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Pilih Kategori</h2>
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-[24px] px-6 text-sm font-bold appearance-none focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text)] group-hover:border-white/20"
              >
                <option value="" disabled className="bg-[#121214]">Pilih Kategori Pengaduan...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#121214] py-4">
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-emerald-400 transition-colors">
                <ChevronDown size={20} />
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Deskripsi Laporan</h2>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan detail masalah yang Anda temukan..."
                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-[24px] p-5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600 resize-none"
              />
            </div>
          </section>

          {/* Camera / Image Upload */}
          <section>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Lampiran Foto</h2>
            
            {imagePreview ? (
              <div className="relative rounded-[32px] overflow-hidden border border-white/10 group">
                <img src={imagePreview} alt="Preview" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[32px] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={28} className="text-emerald-400" />
                </div>
                <p className="text-sm font-bold">Ambil Foto Bukti</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">Buka Kamera / Galeri</p>
              </button>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </section>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-[24px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Kirim Laporan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPengaduan;
