import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { isAuthenticated, api } from '../../utils/auth';
import { toast } from 'react-toastify';
import { ArrowLeft, Send, Info, Loader2 } from 'lucide-react';
import LetterIcon from '../../components/LetterIcon';
import { useTheme } from '../../utils/useTheme';

const jenisList = {
  tidak_mampu: { label: 'Ket. Tidak Mampu' },
  kelahiran: { label: 'Ket. Kelahiran' },
  usaha: { label: 'Ket. Usaha' },
};

// Pengaturan kolom tambahan yang muncul otomatis tergantung jenis suratnya
const dynamicFieldsConfig = {
  kelahiran: [
    { name: 'namaAnak', label: 'Nama Anak', type: 'text', placeholder: 'Sesuai Akta Kelahiran' },
    { name: 'namaAyah', label: 'Nama Ayah', type: 'text', placeholder: 'Sesuai KTP Ayah' },
    { name: 'namaIbu', label: 'Nama Ibu', type: 'text', placeholder: 'Sesuai KTP Ibu' },
  ],
  usaha: [
    { name: 'namaUsaha', label: 'Nama Usaha', type: 'text', placeholder: 'Contoh: Warung Berkah' },
    { name: 'jenisUsaha', label: 'Jenis Usaha', type: 'text', placeholder: 'Contoh: Makanan / Kelontong' },
    { name: 'alamatUsaha', label: 'Alamat Usaha', type: 'textarea', placeholder: 'Detail lokasi usaha' },
  ],
};

const FormPengajuan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jenisSurat = searchParams.get('jenis') || 'tidak_mampu';
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: '',
    nik: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    keperluan: '',
  });

  const [dynamicForm, setDynamicForm] = useState({});

  useEffect(() => {
    // Pastikan user sudah login
    if (!isAuthenticated()) { navigate('/login'); return; }
    // Kalau jenis surat gak ada di daftar, balikin ke halaman layanan
    if (!jenisList[jenisSurat]) { navigate('/layanan', { replace: true }); }
    
    // Siapkan form tambahan kalau suratnya butuh data ekstra (kayak lahir/usaha)
    if (dynamicFieldsConfig[jenisSurat]) {
      const initialDynamicForm = {};
      dynamicFieldsConfig[jenisSurat].forEach(field => {
        initialDynamicForm[field.name] = '';
      });
      setDynamicForm(initialDynamicForm);
    } else {
      setDynamicForm({});
    }
  }, [navigate, jenisSurat]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDynamicChange = (e) => {
    setDynamicForm({ ...dynamicForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, jenisSurat };
      // Gabungkan data profil umum sama data khusus layanannya
      if (Object.keys(dynamicForm).length > 0) {
        payload.dataTambahan = dynamicForm;
      }

      await api.post("/pengajuan", payload);

      toast.success('Pengajuan berhasil dikirim! Silakan tunggu verifikasi admin.');
      navigate('/riwayat');
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const info = jenisList[jenisSurat];
  const jenis = jenisSurat;

  // Class input yang responsif terhadap tema
  const inputClass = "appearance-none w-full px-4 py-4 md:py-3.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary-hover)] focus:ring-1 focus:ring-[var(--primary-glow)] transition-all placeholder:text-[var(--text-muted)]";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Tombol Kembali & Judul Formulir */}
        <header className="px-5 md:px-0 pt-0 pb-6 mb-8 border-b border-[var(--section-border)]">
          <Link to="/layanan" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-emerald-400 transition-colors mb-6 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Layanan
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--primary-subtle)] border border-[var(--primary-border)] rounded-2xl flex items-center justify-center">
              <LetterIcon jenis={jenis} className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">{info.label}</h1>
              <p className="text-sm text-[var(--text-muted)] font-medium">Lengkapi formulir di bawah ini dengan benar.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-10">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-[var(--text)] border-l-2 border-emerald-500 pl-3">Data Pemohon</h2>
            
            {/* Input Nama */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
                className={inputClass}
              />
            </div>

            {/* Input NIK */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">NIK (16 Digit)</label>
              <input
                type="text"
                name="nik"
                value={form.nik}
                onChange={handleChange}
                required
                maxLength={16}
                inputMode="numeric"
                placeholder="Contoh: 3301xxxxxxxxxxxx"
                className={`${inputClass} font-mono`}
              />
            </div>

            {/* Input TTL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={form.tempatLahir}
                  onChange={handleChange}
                  required
                  placeholder="Kota/Kab"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={form.tanggalLahir}
                  onChange={handleChange}
                  required
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-bold text-[var(--text)] border-l-2 border-emerald-500 pl-3">Tujuan Pengajuan</h2>

            {/* Input Alamat */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">Alamat Lengkap</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Jl. / RT / RW / Dusun"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Input Keperluan */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">Keperluan / Alasan</label>
              <textarea
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Alasan mengajukan surat ini..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Form Tambahan (Khusus untuk jenis surat tertentu) */}
            {dynamicFieldsConfig[jenisSurat] && (
              <div className="pt-6 border-t border-[var(--section-border)] space-y-6">
                <h2 className="text-sm font-bold text-[var(--text)] border-l-2 border-emerald-500 pl-3">Data Tambahan Surat</h2>
                {dynamicFieldsConfig[jenisSurat].map((field) => (
                  <div key={field.name}>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-[0.15em]">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={dynamicForm[field.name] || ''}
                        onChange={handleDynamicChange}
                        required
                        rows={3}
                        placeholder={field.placeholder}
                        className={`${inputClass} resize-none`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={dynamicForm[field.name] || ''}
                        onChange={handleDynamicChange}
                        required
                        placeholder={field.placeholder}
                        style={field.type === 'date' ? { colorScheme: isDark ? 'dark' : 'light' } : {}}
                        className={inputClass}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-[var(--primary-subtle)] border border-[var(--primary-border)] rounded-2xl">
              <Info className="w-5 h-5 text-[var(--primary)] shrink-0" />
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                Data ini akan diproses secara digital. Pastikan sudah benar ya sebelum dikirim.
              </p>
            </div>

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mengirim...</>
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
