import { Link } from 'react-router-dom';
import { Shield, Smartphone, HelpCircle, Key, Info, ArrowLeft, MessageCircle } from 'lucide-react';

const Help = () => {
  const scenarios = [
    {
      id: 'ganti-hp',
      title: 'Saya ingin ganti ke HP baru',
      content: 'Login dulu di HP baru menggunakan "Kunci Cadangan" (8 angka unik) yang Anda dapat saat mendaftar. Setelah masuk, buka menu "Keamanan & Kunci HP" lalu klik "Daftarkan HP Lain" untuk mendaftarkan sidik jari di HP baru tersebut.',
      icon: <Smartphone className="w-6 h-6 text-blue-400" />
    },
    {
      id: 'hp-hilang',
      title: 'HP saya hilang, apa yang harus dilakukan?',
      content: 'Segera lapor ke Admin Desa atau gunakan "Kunci Cadangan" Anda di perangkat anggota keluarga yang terpercaya untuk menghapus akses HP yang hilang dari daftar "HP Terdaftar".',
      icon: <Shield className="w-6 h-6 text-red-400" />
    },
    {
      id: 'pin-google',
      title: 'Kenapa diminta PIN Google saat login?',
      content: 'Itu adalah fitur keamanan Google untuk memastikan Anda adalah pemilik akun. Cukup masukkan PIN Google Anda (biasanya 6 angka) sekali saja. Setelah itu, HP akan kembali meminta sidik jari seperti biasa.',
      icon: <Info className="w-6 h-6 text-emerald-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-20 pb-24 px-6 md:px-0 transition-colors duration-300">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3 h-3" />
            Pusat Bantuan Warga
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">Butuh Bantuan Masuk?</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Kami siap membantu Anda jika menemui kesulitan saat menggunakan sistem Login Sidik Jari.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {scenarios.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-6 border border-white/[0.05] hover:border-blue-500/30 transition-all group">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-all">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-600/[0.05] to-emerald-600/[0.05] border border-blue-500/10 text-center">
          <h2 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
            Masih Belum Bisa Masuk?
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
            Silakan hubungi Admin Desa Karangpucung melalui WhatsApp atau datang langsung ke Balai Desa.
          </p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-green-500/20"
          >
            Hubungi Admin Desa
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
