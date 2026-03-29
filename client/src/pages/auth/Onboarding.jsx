import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, ArrowRight, Home, ShieldCheck } from 'lucide-react';

/**
 * Konten slide untuk pengenalan aplikasi (Onboarding).
 */
const slides = [
  {
    icon: Home,
    title: 'Selamat Datang di',
    subtitle: 'Layanan Desa Digital',
    desa: 'Desa Digital',
    desc: 'Platform digital untuk memudahkan warga dalam mengakses layanan administrasi desa kapan saja dan di mana saja.',
    color: 'from-emerald-500/20 to-teal-500/10',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  {
    icon: FileText,
    title: 'Layanan Surat Online',
    subtitle: 'Tanpa Antre, Tanpa Ribet',
    desa: null,
    desc: 'Ajukan surat keterangan tidak mampu, kelahiran, dan usaha langsung dari HP kamu.',
    color: 'from-blue-500/20 to-indigo-500/10',
    accent: 'text-blue-400',
    border: 'border-blue-500/20',
    features: ['Ket. Tidak Mampu', 'Ket. Kelahiran', 'Ket. Usaha'],
  },
  {
    icon: ShieldCheck,
    title: 'Login Tanpa Password',
    subtitle: 'Aman dengan Sidik Jari atau Wajah',
    desa: null,
    desc: 'Daftar dan masuk menggunakan teknologi WebAuthn/FIDO2 — tidak perlu mengingat password lagi.',
    color: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
  },
];

/**
 * Onboarding Component — Menampilkan slider perkenalan fitur aplikasi
 * buat pengguna baru.
 */
const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Jika user sudah pernah melihat onboarding, langsung arahkan ke halaman login
    if (localStorage.getItem('onboarding_done') === 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fungsi untuk berpindah ke slide berikutnya
  const next = () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      finish();
    }
  };

  // Fungsi untuk menandai onboarding selesai dan pindah ke login
  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/login');
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col overflow-hidden transition-colors duration-300">
      {/* Tombol Lewati (Skip) */}
      <div className="flex justify-end px-6 pt-6 relative z-20">
        <button
          onClick={finish}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors font-medium tracking-wide"
        >
          Lewati
        </button>
      </div>

      {/* Konten Slide Utama */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center relative">
        {/* Efek Cahaya Latar (Glow orb) */}
        <div className={`absolute inset-0 pointer-events-none flex items-center justify-center opacity-30`}>
          <div className={`w-96 h-96 rounded-full bg-gradient-radial blur-3xl bg-gradient-to-br ${slide.color}`} />
        </div>

        {/* Ikon Slide */}
        <div className={`relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.color} border ${slide.border} flex items-center justify-center mb-8 shadow-2xl`}>
          <slide.icon className={`w-12 h-12 ${slide.accent}`} />
        </div>

        {/* Baris Teks Slide */}
        <div className="relative z-10 max-w-sm">
          {slide.desa && (
            <p className={`text-xs font-bold uppercase tracking-widest ${slide.accent} mb-2`}>
              {slide.desa}
            </p>
          )}
          <h1 className="text-3xl font-black tracking-tight mb-2 leading-tight">
            {slide.title}
          </h1>
          <p className="text-xl font-bold text-[var(--text-muted)] mb-6">{slide.subtitle}</p>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">{slide.desc}</p>

          {/* Daftar Fitur (hanya muncul di slide tertentu) */}
          {slide.features && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {slide.features.map((f) => (
                <span key={f} className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-gradient-to-br ${slide.color} border ${slide.border} ${slide.accent}`}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigasi Bawah (Indikator Titik & Tombol Lanjut) */}
      <div className="px-8 pb-10 flex flex-col items-center gap-6 relative z-20">
        {/* Titik Indikator (Pagination Dots) */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? `w-8 ${slide.accent.replace('text-', 'bg-')}`
                  : 'w-1.5 bg-[var(--card-border)]'
              }`}
            />
          ))}
        </div>

        {/* Tombol CTA (Lanjut / Mulai) */}
        <button
          onClick={next}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
            isLast
              ? 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
              : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text)] hover:opacity-80'
          }`}
        >
          {isLast ? (
            <>Mulai Sekarang <ArrowRight className="w-5 h-5" /></>
          ) : (
            <>Lanjut <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
