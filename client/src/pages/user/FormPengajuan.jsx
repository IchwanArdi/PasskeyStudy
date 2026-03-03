import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { toast } from 'react-toastify';
import { ArrowLeft, Send, ShieldCheck, User, MapPin, Calendar, FileText, Info, Loader2 } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';

const jenisList = {
  domisili: { label: 'Surat Domisili' },
  tidak_mampu: { label: 'Ket. Tidak Mampu' },
  kelahiran: { label: 'Ket. Kelahiran' },
  kematian: { label: 'Ket. Kematian' },
  usaha: { label: 'Ket. Usaha' },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FormPengajuan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jenisSurat = searchParams.get('jenis') || 'domisili';

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: '',
    nik: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    keperluan: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (!jenisList[jenisSurat]) { navigate('/layanan', { replace: true }); }
  }, [navigate, jenisSurat]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pengajuan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...form, jenisSurat }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim pengajuan');

      toast.success('Pengajuan berhasil dikirim! Silakan cek riwayat pengajuan Anda.');
      navigate('/riwayat');
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const info = jenisList[jenisSurat];
  const jenis = jenisSurat;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-white/5">
          <Link to="/layanan" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Layanan
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <LetterIcon jenis={jenis} className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{info.label}</h1>
              <p className="text-sm text-gray-500 font-medium">Lengkapi formulir di bawah ini untuk pengisian otomatis surat.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3">Data Personal</h2>
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Nama Lengkap</label>
              <input
                type="text"
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                required
                placeholder="Sesuai KTP"
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* NIK */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">NIK (16 Digit)</label>
              <input
                type="text"
                name="nik"
                value={form.nik}
                onChange={handleChange}
                required
                maxLength={16}
                placeholder="Masukkan 16 digit NIK"
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600 font-mono"
              />
            </div>

            {/* Tempat & Tanggal Lahir */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={form.tempatLahir}
                  onChange={handleChange}
                  required
                  placeholder="Kota/Kab"
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={form.tanggalLahir}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3">Rincian Pengajuan</h2>

            {/* Alamat */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Alamat KTP</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Jl. / RT / RW / Dusun / Desa"
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Keperluan */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Tujuan & Keperluan</label>
              <textarea
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Sebutkan alasan atau tujuan pengajuan surat ini..."
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl">
              <Info className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed font-medium">
                Pastikan data sesuai dengan KTP/KK untuk mempercepat verifikasi oleh Admin Desa.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-black font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/10"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
              ) : (
                <><Send className="w-5 h-5" /> Kirim Pengajuan Sekarang</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPengajuan;
