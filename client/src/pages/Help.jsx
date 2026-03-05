import { Link } from 'react-router-dom';
import { Shield, Smartphone, HelpCircle, Key, Info, ArrowLeft, MessageCircle, Lock } from 'lucide-react';

const Help = () => {
  const scenarios = [
    {
      id: 'cara-daftar',
      title: 'Cara Mendaftar Akun',
      content: 'Pilih "Daftar Akun Baru", isi data diri (NIK & Email), lalu aktivasi Biometrik. Cukup sekali daftar untuk akses selamanya tanpa password.',
      icon: <Smartphone className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'sidik-jari',
      title: 'Masalah Sidik Jari',
      content: 'Pastikan jari dan sensor HP bersih. Jika biometrik tidak muncul, pastikan Anda menggunakan browser terbaru (Chrome/Safari) dan fitur kunci layar aktif.',
      icon: <Shield className="w-6 h-6 text-red-500" />
    },
    {
      id: 'kunci-cadangan',
      title: 'Fungsi Kunci Cadangan',
      content: 'Gunakan 4 karakter Kunci Cadangan jika Anda ganti HP atau biometrik tidak terbaca. Simpan kode ini di tempat yang sangat aman dan rahasia.',
      icon: <Key className="w-6 h-6 text-emerald-500" />
    },
    {
      id: 'keamanan',
      title: 'Keamanan Data Anda',
      content: 'Data biometrik Anda aman di dalam chip HP dan tidak pernah dikirim ke server. Kami hanya menggunakan "kunci digital" untuk verifikasi identitas Anda.',
      icon: <Lock className="w-6 h-6 text-amber-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-20 pb-24 px-6 md:px-0 transition-colors duration-300">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3 h-3" />
            Pusat Bantuan Digital
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">Butuh Bantuan Masuk?</h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            Pelajari cara menggunakan sistem keamanan biometrik (sidik jari/wajah) untuk akses layanan desa yang lebih aman dan praktis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {scenarios.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-6 border border-[var(--card-border)] hover:border-blue-500/30 transition-all group">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--card-bg)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all shadow-inner">
                  {s.icon}
                </div>
                <h3 className="text-base font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {s.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-600/[0.04] to-emerald-600/[0.04] border border-blue-500/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <h2 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
            Masih Belum Bisa Masuk?
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto font-medium">
            Jika HP Anda hilang atau biometrik tidak terbaca, silakan hubungi Admin Desa atau datang ke Balai Desa dengan membawa KTP.
          </p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            Hubungi Admin Desa
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--text)] transition-all text-sm font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
