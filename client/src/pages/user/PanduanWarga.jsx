import { useState } from 'react';
import {
  HelpCircle, ChevronDown,
  Shield, UserPlus, AlertTriangle,
  BookOpen, MessageCircle, Info
} from 'lucide-react';

// Konten tanya jawab (FAQ) yang dikategorikan
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
        a: 'Layanan Desa Digital adalah platform online yang memudahkan warga Desa untuk mengurus surat-surat administrasi (seperti Keterangan Tidak Mampu, Kelahiran, dll.) langsung dari HP, tanpa harus antre di kantor desa.',
      },
      {
        q: 'Apa bedanya dengan login pakai password biasa?',
        a: 'Di sini Anda tidak perlu mengingat password sama sekali. Cukup gunakan sidik jari, wajah (Face ID), atau PIN HP Anda untuk masuk. Teknologi ini jauh lebih aman karena kunci keamanan tersimpan di HP Anda, bukan di server.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Sangat aman! Kunci keamanan Anda tidak pernah meninggalkan HP. Yang tersimpan di server hanyalah "kunci publik" yang tidak bisa digunakan untuk login tanpa HP Anda.',
      },
      {
        q: 'HP apa saja yang bisa dipakai?',
        a: 'Hampir semua HP modern bisa digunakan (Android 7 ke atas atau iPhone 6s ke atas). Pastikan browser Anda (Chrome, Safari, Edge) sudah versi terbaru.',
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
        a: '1. Buka aplikasi dan tekan "Daftar Akun Baru"\n2. Isi Nama dan Email\n3. Tekan "Daftar dengan Sidik Jari"\n4. HP akan meminta verifikasi sidik jari/wajah — ikuti instruksinya\n5. Selesai! Akun Anda sudah aktif.',
      },
      {
        q: 'Kenapa HP saya minta PIN Google saat mendaftar?',
        a: 'Ini normal! Google perlu memastikan Anda pemilik HP ini. Cukup masukkan PIN Google Anda. Ini hanya terjadi sekali saat pendaftaran.',
      },
    ],
  },
  {
    id: 'perangkat',
    title: 'Kelola Perangkat',
    subtitle: 'Tambah, hapus, atau ganti HP untuk login',
    icon: Shield,
    color: 'amber',
    items: [
      {
        q: 'Bisakah saya login dari 2 HP berbeda?',
        a: 'Bisa! Anda bisa mendaftarkan lebih dari satu HP. Login dulu di HP utama, masuk ke Profil -> Keamanan Perangkat, lalu pilih "Daftarkan Perangkat Baru".',
      },
      {
        q: 'Bagaimana cara menghapus HP yang sudah tidak dipakai?',
        a: '1. Login di HP yang masih aktif\n2. Buka Profil → Keamanan Perangkat\n3. Temukan perangkat yang ingin dihapus, tekan ikon sampah (🗑️).\n\n⚠️ Penting: Sisakan minimal 1 perangkat yang tetap aktif.',
      },
    ],
  },
  {
    id: 'darurat',
    title: 'Situasi Darurat',
    subtitle: 'HP hilang atau masalah akses',
    icon: AlertTriangle,
    color: 'red',
    items: [
      {
        q: 'HP saya hilang! Apa yang harus dilakukan?',
        a: '🚨 Segera pinjam HP keluarga, lakukan "Pemulihan Akun" pakai Email dan Kunci Cadangan. Setelah masuk, langsung HAPUS perangkat yang hilang dari daftar keamanan.',
      },
      {
        q: 'Saya lupa/kehilangan Kunci Cadangan, bagaimana?',
        a: 'Kalau masih bisa login, cek di menu Keamanan Perangkat. Kalau tidak bisa login sama sekali, silakan datang ke Kantor Desa membawa KTP untuk riset akun oleh admin.',
      },
    ],
  },
];

// Map warna per kategori
const colorMap = {
  blue: {
    bg: 'bg-[var(--bg-raised)]',
    border: 'border-[var(--border)]',
    text: 'text-blue-400',
    iconBg: 'bg-[var(--bg-overlay)]',
    activeBg: 'bg-[var(--bg-overlay)]',
    activeBorder: 'border-blue-400/30',
  },
  emerald: {
    bg: 'bg-[var(--bg-raised)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--primary)]',
    iconBg: 'bg-[var(--primary-subtle)]',
    activeBg: 'bg-[var(--bg-overlay)]',
    activeBorder: 'border-[var(--primary-border)]',
  },
  amber: {
    bg: 'bg-[var(--bg-raised)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--warning)]',
    iconBg: 'bg-[var(--warning-subtle)]',
    activeBg: 'bg-[var(--bg-overlay)]',
    activeBorder: 'border-[var(--warning-border)]',
  },
  red: {
    bg: 'bg-[var(--bg-raised)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--danger)]',
    iconBg: 'bg-[var(--danger-subtle)]',
    activeBg: 'bg-[var(--bg-overlay)]',
    activeBorder: 'border-[var(--danger-border)]',
  },
};

const AccordionItem = ({ item, isOpen, onToggle, color }) => {
  const c = colorMap[color];
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isOpen ? `${c.activeBg} ${c.activeBorder}` : 'bg-[var(--bg-raised)] border-[var(--border)] hover:border-[var(--border-hover)]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className={`text-sm font-semibold leading-snug pr-4 ${isOpen ? c.text : 'text-[var(--text)]'}`}>
          {item.q}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`w-4 h-4 ${c.text}`} />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
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
        {/* Header Panduan */}
        <div className="mb-8 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-subtle)] border border-[var(--primary-border)] rounded-full text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3 h-3" />
            Bantuan
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
            Panduan Penggunaan
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            Semua yang perlu Anda ketahui tentang cara menggunakan Layanan Desa Digital.
          </p>
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              !activeSection
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'bg-[var(--bg-raised)] text-[var(--text-muted)] hover:border-[var(--border-hover)] border border-[var(--border)]'
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
                    ? `bg-[var(--bg-overlay)] ${c.text} border ${c.activeBorder}`
                    : 'bg-[var(--bg-raised)] text-[var(--text-muted)] hover:border-[var(--border-hover)] border border-[var(--border)]'
                }`}
              >
                <section.icon className="w-3.5 h-3.5" />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Konten FAQ */}
        <div className="space-y-8">
          {filteredSections.map((section) => {
            const c = colorMap[section.color];
            const Icon = section.icon;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">{section.title}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{section.subtitle}</p>
                  </div>
                </div>

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

        {/* Kartu Kontak Admin */}
        <div className="mt-10 bg-[var(--bg-raised)] rounded-2xl p-6 border border-[var(--border)] text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-subtle)] border border-[var(--primary-border)] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <h2 className="text-lg font-bold mb-2">Punya Masalah Lain?</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            Hubungi Admin melalui WhatsApp untuk bantuan lebih lanjut.
          </p>
          <a
            href="https://wa.me/6281297988091"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Chat Admin Desa
          </a>
        </div>

        {/* Tips Penting */}
        <div className="mt-6 bg-[var(--warning-subtle)] border border-[var(--warning-border)] rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-raised)] flex items-center justify-center flex-shrink-0 border border-[var(--warning-border)]">
            <Info className="w-5 h-5 text-[var(--warning)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-400 mb-1">Tips Penting</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Selalu simpan Kunci Cadangan Anda di tempat yang aman. Kunci ini satu-satunya cara memulihkan akun kalau HP Anda rusak atau hilang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanduanWarga;
