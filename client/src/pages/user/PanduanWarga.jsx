import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle, ChevronDown, ChevronUp, ArrowLeft,
  Smartphone, Shield, UserPlus, Fingerprint, AlertTriangle,
  Key, RefreshCw, MonitorSmartphone, MessageCircle, BookOpen,
  CheckCircle2, Info, Lock
} from 'lucide-react';

const faqSections = [
  {
    id: 'dasar',
    title: 'Dasar-Dasar',
    subtitle: 'Hal yang perlu diketahui sebelum menggunakan',
    icon: BookOpen,
    color: 'blue',
    items: [
      {
        q: 'Apa itu Layanan Desa Digital?',
        a: 'Layanan Desa Digital adalah platform online yang memudahkan warga Desa Karangpucung untuk mengurus surat-surat administrasi (seperti Surat Domisili, Keterangan Tidak Mampu, dll.) langsung dari HP, tanpa harus antre di kantor desa.',
      },
      {
        q: 'Apa bedanya dengan login pakai password biasa?',
        a: 'Di sini Anda tidak perlu mengingat password sama sekali. Cukup gunakan sidik jari, wajah (Face ID), atau PIN HP Anda untuk masuk. Teknologi ini disebut WebAuthn/FIDO2 — lebih aman karena kunci keamanan tersimpan di HP Anda, bukan di server.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Ya, sangat aman. Kunci keamanan Anda tidak pernah meninggalkan HP. Yang tersimpan di server hanyalah "kunci publik" yang tidak bisa digunakan untuk login tanpa HP Anda. Ini jauh lebih aman daripada password biasa yang bisa ditebak atau dicuri.',
      },
      {
        q: 'HP apa saja yang bisa dipakai?',
        a: 'Hampir semua HP modern bisa digunakan:\n• Android 7 ke atas (Samsung, Xiaomi, Oppo, Vivo, dll.)\n• iPhone 6s ke atas\n• Laptop/PC dengan Windows Hello atau Touch ID\n\nPastikan browser Anda (Chrome, Safari, Edge) sudah versi terbaru.',
      },
    ],
  },
  {
    id: 'daftar',
    title: 'Cara Mendaftar',
    subtitle: 'Langkah-langkah membuat akun baru',
    icon: UserPlus,
    color: 'emerald',
    items: [
      {
        q: 'Bagaimana cara mendaftar akun baru?',
        a: '1. Buka aplikasi dan tekan "Daftar Akun Baru"\n2. Isi Nama Lengkap, Email, dan NIK\n3. Tekan "Daftar dengan Sidik Jari"\n4. HP akan meminta verifikasi sidik jari/wajah — ikuti instruksinya\n5. Selesai! Akun Anda sudah aktif\n\n⏱️ Proses ini hanya memakan waktu kurang dari 1 menit.',
      },
      {
        q: 'Kenapa HP saya minta PIN Google saat mendaftar?',
        a: 'Ini normal! Google perlu memastikan Anda pemilik HP ini. Cukup masukkan PIN Google Anda (biasanya 4-6 angka). Ini hanya terjadi sekali. Setelah itu, HP akan langsung meminta sidik jari saat login.',
      },
      {
        q: 'Saya sudah mendaftar tapi tidak bisa masuk, kenapa?',
        a: 'Pastikan:\n• Anda login menggunakan HP yang sama saat mendaftar\n• Sidik jari/wajah yang digunakan sudah terdaftar di HP\n• Browser yang digunakan sama (contoh: Chrome)\n• Koneksi internet stabil\n\nJika masih tidak bisa, gunakan Kunci Cadangan atau hubungi Admin Desa.',
      },
    ],
  },
  {
    id: 'login',
    title: 'Cara Login',
    subtitle: 'Masuk ke akun yang sudah terdaftar',
    icon: Fingerprint,
    color: 'violet',
    items: [
      {
        q: 'Bagaimana cara login?',
        a: '1. Buka aplikasi\n2. Tekan tombol "Masuk dengan Sidik Jari"\n3. Tempelkan jari Anda di sensor sidik jari HP\n4. Selesai — Anda langsung masuk ke Dashboard\n\n💡 Tips: Jika menggunakan Face ID, cukup arahkan wajah ke kamera.',
      },
      {
        q: 'Kenapa sidik jari saya tidak dikenali?',
        a: 'Beberapa penyebab umum:\n• Jari basah atau kotor — keringkan dulu\n• Sensor sidik jari kotor — bersihkan dengan kain lembut\n• Sidik jari yang didaftarkan berbeda — coba jari lain\n• Screen protector terlalu tebal — lepas sementara saat login\n\nJika tetap gagal, gunakan PIN HP atau Kunci Cadangan.',
      },
    ],
  },
  {
    id: 'perangkat',
    title: 'Kelola Perangkat',
    subtitle: 'Tambah, hapus, atau ganti HP untuk login',
    icon: MonitorSmartphone,
    color: 'amber',
    items: [
      {
        q: 'Bisakah saya login dari 2 HP berbeda?',
        a: 'Bisa! Anda bisa mendaftarkan lebih dari satu HP. Caranya:\n1. Login di HP utama Anda\n2. Buka menu Profil → Keamanan Perangkat\n3. Tekan "Daftarkan Perangkat Baru"\n4. Di HP baru, buka aplikasi dan ikuti instruksi\n5. Verifikasi sidik jari di HP baru\n\nKedua HP sekarang bisa digunakan untuk login.',
      },
      {
        q: 'Saya mau ganti ke HP baru, bagaimana caranya?',
        a: '1. Sebelum ganti HP, pastikan Anda punya Kunci Cadangan (8 karakter unik yang didapat saat mendaftar)\n2. Di HP baru, buka aplikasi → pilih "Pemulihan Akun"\n3. Masukkan email dan Kunci Cadangan Anda\n4. Daftarkan sidik jari di HP baru\n5. (Opsional) Hapus HP lama dari daftar perangkat di menu Keamanan Perangkat',
      },
      {
        q: 'Bagaimana cara menghapus HP yang sudah tidak dipakai?',
        a: '1. Login di HP yang masih aktif\n2. Buka Profil → Keamanan Perangkat\n3. Temukan perangkat yang ingin dihapus\n4. Tekan ikon hapus (🗑️) di samping perangkat tersebut\n5. Konfirmasi penghapusan\n\n⚠️ Penting: Jangan hapus semua perangkat sekaligus! Pastikan minimal 1 perangkat tetap aktif.',
      },
    ],
  },
  {
    id: 'darurat',
    title: 'Situasi Darurat',
    subtitle: 'HP hilang, lupa akses, atau masalah teknis',
    icon: AlertTriangle,
    color: 'red',
    items: [
      {
        q: 'HP saya hilang/dicuri! Apa yang harus dilakukan?',
        a: '🚨 Langkah darurat:\n1. SEGERA pinjam HP keluarga yang terpercaya\n2. Buka aplikasi → pilih "Pemulihan Akun"\n3. Masukkan email dan Kunci Cadangan Anda\n4. Setelah masuk, buka Profil → Keamanan Perangkat\n5. HAPUS HP yang hilang dari daftar perangkat\n6. Daftarkan HP baru sebagai perangkat pengganti\n\n💡 Dengan menghapus HP yang hilang, orang lain tidak bisa mengakses akun Anda meskipun punya HP tersebut.',
      },
      {
        q: 'Saya lupa/kehilangan Kunci Cadangan, bagaimana?',
        a: 'Jika Anda masih bisa login:\n1. Buka Profil → Keamanan Perangkat\n2. Anda bisa melihat atau me-reset Kunci Cadangan di sana\n\nJika tidak bisa login sama sekali:\n1. Datang ke Kantor Desa Karangpucung dengan membawa KTP\n2. Admin Desa akan membantu reset akun Anda\n3. Anda perlu mendaftar ulang sidik jari\n\n⚠️ Simpan Kunci Cadangan di tempat aman (catat di kertas, simpan di dompet).',
      },
      {
        q: 'Layar HP saya rusak, tidak bisa pakai sidik jari',
        a: 'Jika HP masih bisa digunakan:\n• Coba gunakan PIN HP atau pattern sebagai alternatif (beberapa HP mendukung ini)\n\nJika HP benar-benar tidak bisa digunakan:\n1. Gunakan Kunci Cadangan di HP lain\n2. Atau hubungi Admin Desa untuk bantuan reset akun',
      },
      {
        q: 'Browser menampilkan error atau halaman tidak muncul',
        a: 'Coba langkah berikut:\n1. Tutup browser dan buka ulang\n2. Hapus cache browser: Pengaturan → Privasi → Hapus Data Browsing\n3. Pastikan koneksi internet stabil\n4. Update browser ke versi terbaru\n5. Coba gunakan browser lain (Chrome direkomendasikan)\n\nJika masih bermasalah, hubungi Admin Desa.',
      },
    ],
  },
  {
    id: 'kunci',
    title: 'Kunci Cadangan',
    subtitle: 'Cara mendapatkan dan menggunakan kunci pemulihan',
    icon: Key,
    color: 'cyan',
    items: [
      {
        q: 'Apa itu Kunci Cadangan?',
        a: 'Kunci Cadangan adalah kode unik berisi 8 karakter (huruf dan angka) yang berfungsi sebagai "kunci darurat" jika Anda tidak bisa login dengan sidik jari. Anggap saja seperti kunci cadangan rumah — simpan di tempat aman!',
      },
      {
        q: 'Kapan saya perlu menggunakan Kunci Cadangan?',
        a: 'Gunakan Kunci Cadangan saat:\n• HP hilang atau rusak\n• Ganti ke HP baru\n• Sidik jari tidak terbaca setelah berkali-kali\n• Ingin menambahkan perangkat baru dari HP yang belum terdaftar',
      },
      {
        q: 'Bagaimana cara menggunakan Kunci Cadangan?',
        a: '1. Di halaman login, tekan "Pemulihan Akun"\n2. Masukkan alamat email yang terdaftar\n3. Masukkan Kunci Cadangan 8 karakter Anda\n4. Sistem akan memverifikasi dan meminta Anda mendaftarkan sidik jari baru\n5. Setelah berhasil, Anda bisa login seperti biasa',
      },
    ],
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    activeBg: 'bg-blue-500/[0.06]',
    activeBorder: 'border-blue-500/15',
  },
  emerald: {
    bg: 'bg-emerald-500/[0.08]',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    activeBg: 'bg-emerald-500/[0.06]',
    activeBorder: 'border-emerald-500/15',
  },
  violet: {
    bg: 'bg-violet-500/[0.08]',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    activeBg: 'bg-violet-500/[0.06]',
    activeBorder: 'border-violet-500/15',
  },
  amber: {
    bg: 'bg-amber-500/[0.08]',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    activeBg: 'bg-amber-500/[0.06]',
    activeBorder: 'border-amber-500/15',
  },
  red: {
    bg: 'bg-red-500/[0.08]',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconBg: 'bg-red-500/10',
    activeBg: 'bg-red-500/[0.06]',
    activeBorder: 'border-red-500/15',
  },
  cyan: {
    bg: 'bg-cyan-500/[0.08]',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    activeBg: 'bg-cyan-500/[0.06]',
    activeBorder: 'border-cyan-500/15',
  },
};

const AccordionItem = ({ item, isOpen, onToggle, color }) => {
  const c = colorMap[color];
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isOpen ? `${c.activeBg} ${c.activeBorder}` : 'border-white/[0.05] hover:border-white/[0.1]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className={`text-sm font-semibold leading-snug pr-4 ${isOpen ? c.text : ''}`}>
          {item.q}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`w-4 h-4 ${c.text}`} />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
            {item.a}
          </div>
        </div>
      )}
    </div>
  );
};

const PanduanWarga = () => {
  const [openItems, setOpenItems] = useState({});
  const [activeSection, setActiveSection] = useState(null);

  const toggleItem = (sectionId, index) => {
    const key = `${sectionId}-${index}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSections = activeSection
    ? faqSections.filter((s) => s.id === activeSection)
    : faqSections;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans pt-12 md:pt-0 pb-24 px-4 md:px-0 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-medium mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Profil
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3 h-3" />
            Panduan Warga
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Panduan Penggunaan Aplikasi
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Semua yang perlu Anda ketahui tentang cara menggunakan Layanan Desa Digital.
          </p>
        </div>

        {/* Quick Nav - Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              !activeSection
                ? 'bg-white text-black'
                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            Semua
          </button>
          {faqSections.map((section) => {
            const c = colorMap[section.color];
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(isActive ? null : section.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${c.bg} ${c.text} border ${c.border}`
                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                <section.icon className="w-3.5 h-3.5" />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredSections.map((section) => {
            const c = colorMap[section.color];
            const Icon = section.icon;
            return (
              <div key={section.id}>
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">{section.title}</h2>
                    <p className="text-xs text-gray-600">{section.subtitle}</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      item={item}
                      isOpen={openItems[`${section.id}-${i}`]}
                      onToggle={() => toggleItem(section.id, i)}
                      color={section.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Card */}
        <div className="mt-10 glass-card rounded-2xl p-6 bg-gradient-to-br from-blue-600/[0.04] to-emerald-600/[0.04] border border-blue-500/10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">Masih Ada Pertanyaan?</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Jangan ragu menghubungi Admin Desa Karangpucung melalui WhatsApp atau datang langsung ke Balai Desa.
          </p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Admin Desa
          </a>
        </div>

        {/* Tip Card */}
        <div className="mt-6 bg-amber-500/[0.05] border border-amber-500/10 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-400 mb-1">Tips Penting</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Selalu simpan Kunci Cadangan Anda di tempat yang aman (catat di kertas, simpan di dompet). Kunci ini adalah satu-satunya cara untuk memulihkan akun jika HP Anda hilang atau rusak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanduanWarga;
