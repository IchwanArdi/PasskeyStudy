import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Settings, Lock, Shield, Key, BarChart3, Code, Menu, X, Github, CheckCircle, LogOut, User, PanelLeftClose, PanelLeftOpen, ExternalLink } from 'lucide-react';
import { isAuthenticated, clearAuth } from '../utils/auth';

const sections = [
  { 
    group: 'Getting Started',
    items: [
      { id: 'introduction', title: 'Introduction', icon: BookOpen },
      { id: 'installation', title: 'Installation', icon: Settings },
      { id: 'user-guide', title: 'User Guide', icon: BookOpen },
    ]
  },
  {
    group: 'Core Concepts',
    items: [
      { id: 'authentication', title: 'Authentication Flow', icon: Lock },
      { id: 'webauthn', title: 'WebAuthn / FIDO2', icon: Shield },
      { id: 'password', title: 'Password Systems', icon: Key },
    ]
  },
  {
    group: 'Analytics',
    items: [
      { id: 'dashboard', title: 'Dashboard Metrics', icon: BarChart3 },
      { id: 'cost-analysis', title: 'Cost Analysis', icon: BarChart3 },
      { id: 'compatibility', title: 'Compatibility', icon: Settings },
      { id: 'methodology', title: 'Methodology', icon: BarChart3 },
    ]
  },
  {
    group: 'Resources',
    items: [
      { id: 'api', title: 'API Reference', icon: Code },
    ]
  }
];

const onPageSections = {
  introduction: [
    { id: 'overview', title: 'Ringkasan' },
    { id: 'features', title: 'Fitur' },
    { id: 'getting-started', title: 'Memulai' },
  ],
  installation: [
    { id: 'requirements', title: 'Persyaratan Sistem' },
    { id: 'setup', title: 'Setup & Instalasi' },
    { id: 'configuration', title: 'Konfigurasi Environment' },
  ],
  'user-guide': [
    { id: 'how-to-register', title: 'Cara Mendaftar & Login' },
    { id: 'how-to-simulate', title: 'Cara Menjalankan Simulasi' },
    { id: 'how-to-survey', title: 'Cara Mengisi Survei UX' },
  ],
  authentication: [
    { id: 'flow', title: 'Alur Autentikasi' },
    { id: 'architecture', title: 'Arsitektur' },
  ],
  webauthn: [
    { id: 'registration', title: 'Registrasi Kredensial' },
    { id: 'login', title: 'Verifikasi Login' },
    { id: 'security', title: 'Keamanan Kriptografi' },
  ],
  password: [
    { id: 'legacy', title: 'Sistem Legacy' },
    { id: 'baseline', title: 'Data Baseline' },
  ],
  dashboard: [
    { id: 'overview', title: 'Ringkasan Metrik' },
    { id: 'metrics', title: 'Analisis Perbandingan' },
  ],
  'cost-analysis': [
    { id: 'implementation', title: 'Biaya Implementasi' },
    { id: 'operational', title: 'Biaya Operasional' },
    { id: 'roi', title: 'Analisis ROI' },
  ],
  compatibility: [
    { id: 'browser', title: 'Browser Support' },
    { id: 'device', title: 'Dukungan Perangkat' },
    { id: 'accessibility', title: 'Aksesibilitas (WCAG)' },
  ],
  methodology: [
    { id: 'security-math', title: 'Perhitungan Keamanan' },
    { id: 'performance-math', title: 'Metrik Performa (Latensi)' },
    { id: 'ux-math', title: 'Kalkulasi Skor SUS' },
  ],
  api: [
    { id: 'endpoints', title: 'Daftar Endpoint' },
    { id: 'auth-api', title: 'Auth API' },
    { id: 'stats-api', title: 'Stats API' },
  ],
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOnPage, setActiveOnPage] = useState('overview');

  const authenticated = isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    const element = document.getElementById(activeSection);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [activeSection]);

  useEffect(() => {
    const currentOnPage = onPageSections[activeSection] || onPageSections.introduction;
    if (currentOnPage.length === 0) return;

    const observerOptions = { root: null, rootMargin: '-80px 0px -80% 0px', threshold: 0 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (currentOnPage.some((item) => item.id === id)) {
            setActiveOnPage(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    currentOnPage.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeSection]);

  const currentOnPage = onPageSections[activeSection] || onPageSections.introduction;

  useEffect(() => {
    const current = onPageSections[activeSection] || onPageSections.introduction;
    const timer = setTimeout(() => {
      if (current.length > 0) {
        setActiveOnPage(current[0].id);
      } else {
        setActiveOnPage('');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-white font-bold tracking-tighter flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>WebAuthn Research</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/docs" className="text-white text-sm font-medium">Docs</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">About</Link>
              <a href="https://github.com/IchwanArdi/PasskeyStudy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">GitHub</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-md text-gray-500 text-xs font-mono">
              Search docs... <span className="bg-white/10 px-1 rounded text-[10px]">Ctrl K</span>
            </div>
            <Link
              to="/login"
              className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex pt-14">
        {/* Left Sidebar */}
        <aside className={`
          fixed lg:sticky top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-white/[0.08] bg-black overflow-y-auto z-40 lg:z-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            {/* Context Switcher Mock */}
            <div className="mb-8 p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Research Docs</div>
                  <div className="text-xs font-semibold">v1.0.0</div>
                </div>
              </div>
              <Settings className="w-3 h-3 text-gray-600" />
            </div>

            <nav className="space-y-8">
              {sections.map((group) => (
                <div key={group.group}>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">{group.group}</h4>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors text-left
                            ${isActive ? 'text-white font-semibold bg-white/[0.05]' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}
                          `}
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col lg:flex-row">
          <div className="flex-1 px-6 lg:px-12 py-10 max-w-4xl">
            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mb-6 flex items-center gap-2 text-gray-400 text-sm font-medium"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              Menu
            </button>
            {activeSection === 'introduction' && (
              <div id="introduction" className="space-y-8 sm:space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold">
                    <BookOpen className="w-3 h-3" />
                    Fondasi Penelitian
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 animate-fade-in-up">Introduction</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Framework autentikasi dengan ketahanan tinggi yang dirancang untuk analisis empiris standar WebAuthn dan FIDO2.
                  </p>
                </div>

                <div id="overview" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Lingkup Proyek</h2>
                  <p className="text-gray-400 leading-relaxed text-base">
                    WebAuthn Research adalah implementasi komprehensif protokol autentikasi tanpa password. Proyek ini menyediakan lingkungan dual-vektor untuk membandingkan sistem shared-secret tradisional dengan kriptografi kunci publik modern
                    berbasis hardware.
                  </p>
                </div>

                <div id="features" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Kapabilitas Utama</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Dukungan Native FIDO2/WebAuthn', 'Vektor Perbandingan Legacy', 'Dashboard Analitik Real-time', 'Mesin Simulasi Keamanan', 'Analisis Beban Kognitif', 'Peta Ketahanan Phishing'].map((feature) => (
                      <div key={feature} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3 hover:border-blue-500/20 transition-all">
                        <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'threat-model' && (
              <div id="threat-model" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/[0.08] border border-red-500/20 rounded-full text-red-400 text-xs font-semibold">
                    <Shield className="w-3 h-3" />
                    Security Research
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Threat Model</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Analisis formal terhadap vektor serangan dan bagaimana arsitektur WebAuthn memitigasi risiko keamanan pada aplikasi web modern.
                  </p>
                </div>

                <div id="stride" className="space-y-6 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">STRIDE Analysis</h2>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
                    <div className="min-w-[600px]">
                      <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-4 px-4 bg-white/[0.02]">Threat</th>
                          <th className="py-4 px-4">Deskripsi</th>
                          <th className="py-4 px-4 bg-white/[0.02]">Mitigasi WebAuthn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr>
                          <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Spoofing</td>
                          <td className="py-4 px-4 text-gray-400">Penyerang berpura-pura menjadi user atau server sah untuk mencuri kredensial.</td>
                          <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Origin check & domain binding mencegah phishing dan situs palsu.</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Tampering</td>
                          <td className="py-4 px-4 text-gray-400">Data autentikasi dimodifikasi saat transit (Man-in-the-Middle).</td>
                          <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Digital signature (asymmetric cryptography) menjamin integritas payload.</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Repudiation</td>
                          <td className="py-4 px-4 text-gray-400">User mengklaim tidak melakukan login atau transaksi tertentu.</td>
                          <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Kunci privat yang tersimpan aman di TPM/hardware memberikan bukti non-repudiation.</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Information Disclosure</td>
                          <td className="py-4 px-4 text-gray-400">Kebocoran password database mengungkap kredensial ribuan user.</td>
                          <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Hanya kunci publik yang disimpan di server. Kebocoran database tidak berisiko credential stuffing.</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Denial of Service</td>
                          <td className="py-4 px-4 text-gray-400">Penyerang membanjiri server dengan percobaan login (Brute Force).</td>
                          <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">WebAuthn tidak bisa di-brute force karena menggunakan tantangan (challenge) unik per sesi.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic lg:hidden mt-2">Geser ke kanan untuk melihat detail mitigasi →</p>
              </div>

                <div id="mitigations" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Vektor Serangan & Mitigasi</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                      <h4 className="font-bold text-blue-400 mb-2">1. Phishing Resilience</h4>
                      <p className="text-sm text-gray-400">WebAuthn mengikat (bind) kredensial ke origin domain. Browser tidak akan mengizinkan autentikator merespons tantangan dari domain yang berbeda (misal: faceb00k.com vs facebook.com).</p>
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                      <h4 className="font-bold text-blue-400 mb-2">2. Credential Stuffing Mitigation</h4>
                      <p className="text-sm text-gray-400">Karena tidak ada password (shared secret), penyerang tidak dapat menggunakan daftar username/password yang bocor dari situs lain untuk membajak akun di sistem ini.</p>
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                      <h4 className="font-bold text-blue-400 mb-2">3. Replay Attack Prevention</h4>
                      <p className="text-sm text-gray-400">Setiap upacara (ceremony) menggunakan "cryptographic nonce" atau challenge yang hanya berlaku satu kali, mencegah penyerang merekam dan mengirim ulang paket data sah.</p>
                    </div>
                  </div>
                </div>

                <div id="recovery-security" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Keamanan Alur Pemulihan</h2>
                  <p className="text-gray-400 leading-relaxed">
                    Alur pemulihan (recovery flow) seringkali menjadi titik terlemah dalam sistem passwordless. Sistem ini menerapkan <span className="text-blue-400">Offline Recovery Codes</span> yang di-hash menggunakan SHA-256 sebelum disimpan ke database, memastikan bahkan jika database bocor, penyerang tidak bisa langsung memulihkan akun tanpa brute forcing kode tersebut secara offline.
                  </p>
                </div>
              </div>
            )}

            {/* Instalasi */}
            {activeSection === 'installation' && (
              <div id="installation" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/[0.08] border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                    <Settings className="w-3 h-3" />
                    Setup & Deploy
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Installation</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Panduan lengkap untuk mengatur dan menjalankan lingkungan proyek WebAuthn secara lokal.
                  </p>
                </div>

                <div id="requirements" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Persyaratan Sistem</h2>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li>Node.js (v18 atau lebih baru disarankan)</li>
                    <li>MongoDB (Local instance atau MongoDB Atlas)</li>
                    <li>Browser modern yang mendukung WebAuthn API (Chrome, Firefox, Safari, Edge)</li>
                    <li>Perangkat dengan autentikator bawaan (seperti Windows Hello, Touch ID) atau kunci keamanan fisik (seperti YubiKey) untuk pengujian.</li>
                  </ul>
                </div>

                <div id="setup" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Setup & Instalasi</h2>
                  <p className="text-gray-400">Proyek ini menggunakan struktur monorepo terpisah untuk klien (React) dan server (Express/Node.js).</p>
                  
                  <div className="p-4 bg-black/50 border border-white/10 rounded-lg overflow-x-auto font-mono text-sm text-gray-300">
                    <p># Clone repositori</p>
                    <p>git clone https://github.com/IchwanArdi/PasskeyStudy.git</p>
                    <p>cd PasskeyStudy</p>
                    <br/>
                    <p># Install dependensi backend</p>
                    <p>cd server</p>
                    <p>npm install</p>
                    <br/>
                    <p># Install dependensi frontend</p>
                    <p>cd ../client</p>
                    <p>npm install</p>
                  </div>
                </div>

                <div id="configuration" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Konfigurasi Environment</h2>
                  <p className="text-gray-400">Buat file `.env` di direktori `server` dengan konfigurasi berikut:</p>
                  <div className="p-4 bg-black/50 border border-white/10 rounded-lg font-mono text-sm text-gray-300">
                    <p>PORT=5000</p>
                    <p>MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster&gt;.mongodb.net/?appName=passkey</p>
                    <p>JWT_SECRET=your_jwt_secret_key</p>
                    <p>NODE_ENV=development</p>
                    <p>RP_ID=localhost</p>
                    <p>RP_ORIGIN=http://localhost:5173</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-4">Catatan: `RP_ID` (Relying Party ID) harus sama dengan domain tempat aplikasi berjalan. Untuk pengembangan lokal, gunakan `localhost`.</p>
                </div>
              </div>
            )}

            {/* Autentikasi */}
            {activeSection === 'authentication' && (
              <div id="authentication" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold">
                    <Lock className="w-3 h-3" />
                    Core System
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Authentication</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Arsitektur unik yang sepenuhnya meniadakan penggunaan password demi keamanan cryptografis kunci publik.
                  </p>
                </div>

                <div id="flow" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Alur Autentikasi</h2>
                  <p className="text-gray-400">Aplikasi ini dirancang sebagai sistem "Passwordless-only". Fitur login menggunakan password secara sengaja dihapus untuk fokus pada keamanan FIDO2.</p>
                  <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
                    <li>Pengguna memasukkan alamat email.</li>
                    <li>Sistem mengecek ketersediaan kredensial WebAuthn yang terdaftar untuk email tersebut.</li>
                    <li>Server menghasilkan sebuah `challenge` (nonce kriptografis).</li>
                    <li>Autentikator perangkat (biometrik atau hardware key) menandatangani challenge tersebut menggunakan private key.</li>
                    <li>Server memverifikasi tanda tangan menggunakan public key pengguna yang tersimpan di database dan meretur JWT token.</li>
                  </ol>
                </div>

                <div id="architecture" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Arsitektur Kunci Publik</h2>
                  <p className="text-gray-400">Berbeda dengan sistem berbasis shared-secret, server kami tidak pernah menyimpan data rahasia yang bisa dicuri. Hanya kunci publik yang disimpan di database `Credentials`.</p>
                  <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    <h4 className="font-bold text-blue-400 mb-2">Penyimpanan Kredensial</h4>
                    <p className="text-sm text-gray-400">Model kredensial menyimpan `credentialID`, `publicKey` (disimpan dalam format Buffer), dan `counter` untuk mencegah serangan replay dari kloning autentikator.</p>
                  </div>
                </div>
              </div>
            )}

            {/* WebAuthn */}
            {activeSection === 'webauthn' && (
              <div id="webauthn" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold">
                    <Shield className="w-3 h-3" />
                    FIDO2 Protocol
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">WebAuthn / FIDO2</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Implementasi standar W3C Web Authentication API menggunakan @simplewebauthn.
                  </p>
                </div>

                <div id="registration" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Registrasi Kredensial</h2>
                  <p className="text-gray-400">API Registrasi diakses melalui `/api/auth/webauthn/register`. Proses ini menggunakan `generateRegistrationOptions` untuk meminta browser mengaktifkan autentikator perangkat.</p>
                  <div className="p-4 bg-black/50 border border-white/10 rounded-lg overflow-x-auto font-mono text-sm text-gray-300">
                    <p>// Payload pendaftaran dari perangkat klien</p>
                    <p>&#123;</p>
                    <p>  "id": "A4C...",</p>
                    <p>  "rawId": "A4C...",</p>
                    <p>  "response": &#123;</p>
                    <p>    "attestationObject": "o2N...",</p>
                    <p>    "clientDataJSON": "eyJ..."</p>
                    <p>  &#125;,</p>
                    <p>  "type": "public-key"</p>
                    <p>&#125;</p>
                  </div>
                </div>

                <div id="login" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Verifikasi Login</h2>
                  <p className="text-gray-400">Proses login difasilitasi oleh `verifyAuthenticationResponse`. Backend mengambil kredensial berdasarkan `credentialID` dan memverifikasi kriptografi signature sebelum menerbitkan sesi JWT.</p>
                </div>

                <div id="security" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Keamanan Kriptografi</h2>
                  <p className="text-gray-400">Semua request dikendalikan oleh "Origin Binding". Ini berarti WebAuthn menolak autentikasi pada domain phishing karena origin browser tidak cocok dengan origin aplikasi asli (Mencegah serangan Man-in-the-Middle).</p>
                </div>
              </div>
            )}

            {/* Password */}
            {activeSection === 'password' && (
              <div id="password" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-500/[0.08] border border-gray-500/20 rounded-full text-gray-400 text-xs font-semibold">
                    <Key className="w-3 h-3" />
                    Legacy Base
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Password Systems</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Penjelasan metrik dan implementasi simulasi password. Sistem login password yang sesungguhnya telah dihapus sepenuhnya dari aplikasi.
                  </p>
                </div>

                <div id="legacy" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Sistem Legacy (Removed)</h2>
                  <p className="text-gray-400">Aplikasi sebelumnya menggunakan arsitektur Bcrypt untuk manajemen hash password. Walau aman untuk standar password, sistem ini rentan bocor melalui rekayasa sosial atau serangan offline sehingga fitur ini dihapus seluruhnya dari interface login pengguna untuk studi riset sepenuhnya pada WebAuthn.</p>
                </div>

                <div id="baseline" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Data Baseline untuk Perbandingan</h2>
                  <p className="text-gray-400">Karena fitur login password di-nonaktifkan, dashboard pembanding kami (Seperti Waktu Latensi dan Ketahanan Phishing) memerlukan kumpulan data standar untuk metode ini.</p>
                  <p className="text-gray-400">Untuk mengatasi hal ini, ada skrip `passwordBaselineSeeder.js` yang akan menyuntikkan 50 baris catatan historis komprehensif ke `PerformanceLog` dan `AuthLog` untuk merepresentasikan pola login pengguna berdasarkan Laporan Industri dari FIDO Alliance dan standar penelitian.</p>
                </div>
              </div>
            )}

            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div id="dashboard" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold">
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Dashboard & Metrics</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Sistem analitik komprehensif untuk memantau aktivitas autentikasi, latensi performa, survei kemudahan penggunaan (UX), dan penilaian keamanan.
                  </p>
                </div>

                <div id="overview" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Ringkasan Metrik</h2>
                  <p className="text-gray-400">Dashboard utamanya mengambil agregasi data dinamis yang merangkum hasil aktivitas Auth, Beban Kognitif, Statistik Penundaan Waktu, dan Penghematan Biaya.</p>
                  <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4">
                    <li>Semua grafik di dashboard sepenuhnya dinamis (tidak di-hardcode) dari MongoDB.</li>
                    <li>Sistem UX menggunakan SUS (System Usability Scale) terstandar.</li>
                    <li>Sistem Performance metrik melacak ukuran bytes request API.</li>
                  </ul>
                </div>

                <div id="metrics" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Analisis Perbandingan</h2>
                  <p className="text-gray-400">Modul Perbandingan khusus membandingkan log WebAuthn real-time terhadap statistik Password baseline historis, memberikan skor kompetitif yang terlihat dari skala `1 hingga 100` pada faktor Ketahanan Phishing dan Ketahanan Brute Force.</p>
                </div>
              </div>
            )}

            {/* Cost Analysis */}
            {activeSection === 'cost-analysis' && (
              <div id="cost-analysis" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/[0.08] border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-semibold">
                    <BarChart3 className="w-3 h-3" />
                    Financial Study
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Cost Analysis</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Perbandingan empiris antara biaya ekonomi untuk memelihara Autentikasi Password vs WebAuthn.
                  </p>
                </div>

                <div id="implementation" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Biaya Implementasi (Capex)</h2>
                  <p className="text-gray-400">Analisis ini mendokumentasikan investasi awal (Development, Frontend, Backend, dan Waktu Eksekusi Pengujian). Meskipun WebAuthn menuntut waktu setup awal yang sedikit lebih banyak (Kurva Pembelajaran & Arsitektur Enclave), ini dibayar oleh keamanan jangka panjangnya.</p>
                </div>

                <div id="operational" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Biaya Operasional (Opex)</h2>
                  <p className="text-gray-400">Biaya yang berjalan (ongoing). Modul ini secara aktif menghitung waktu tiket dukungan (support tickets) pengguna nyata yang berkaitan dengan pengadaan kredensial. Contohnya: "Lupa password", "Reset akun", atau "Terkunci dari sistem".</p>
                </div>

                <div id="roi" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Return on Investment (ROI)</h2>
                  <p className="text-gray-400">Dasbor ROI menghitung <span className="text-green-400">Payback Period</span> (Durasi impas) dan potensi <span className="text-green-400">Cost Savings</span> secara historikal setelah menerapkan transisi infrastruktur FIDO2 ini.</p>
                </div>
              </div>
            )}

            {/* Compatibility */}
            {activeSection === 'compatibility' && (
              <div id="compatibility" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/[0.08] border border-teal-500/20 rounded-full text-teal-400 text-xs font-semibold">
                    <Settings className="w-3 h-3" />
                    Environment
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">System Compatibility</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Pemeriksaan matrik kompatibilitas lintas perangkat terhadap kapabilitas modern WebAuthn API.
                  </p>
                </div>

                <div id="browser" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Browser Support</h2>
                  <p className="text-gray-400">Modul kompatibilitas menelusuri data User Agent dari semua interaksi pengujian untuk menentukan peramban-peramban (Chrome, Safari, Firefox) mana yang mencapai sukses atau kendala API Hardware ketika mengeksekusi public-key credentials.</p>
                </div>

                <div id="device" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Dukungan Perangkat & Sistem Operasi</h2>
                  <p className="text-gray-400">Platform pendukung. Dashboard ini menunjukkan statistik adopsi Mac, Windows, maupun Platform Mobile, dipetakan secara dinamis berdasarkan data empiris percobaan otentikasi nyata.</p>
                </div>

                <div id="accessibility" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Aksesibilitas (Standar WCAG)</h2>
                  <p className="text-gray-400">Bagaimana fitur ini memengaruhi aksesibilitas. Otentikasi WebAuthn dinilai berdasarkan matriks pedoman WCAG Level (Seberapa baik ia merespons Keyboard navigation, Screen Reader, serta Gangguan Visual/Kognitif).</p>
                </div>
              </div>
            )}

            {/* User Guide */}
            {activeSection === 'user-guide' && (
              <div id="user-guide" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/[0.08] border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                    <BookOpen className="w-3 h-3" />
                    Tutorial
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">User Guide</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Petunjuk langkah-demi-langkah tentang cara menggunakan semua fitur yang tersedia di dalam aplikasi penelitian web ini.
                  </p>
                </div>

                <div id="how-to-register" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Cara Mendaftar & Login</h2>
                  <ol className="list-decimal list-inside text-gray-400 space-y-3">
                    <li>Kunjungi halaman <span className="text-blue-400">Mulai (Beranda)</span> dan masukkan alamat email Anda ke dalam field yang tersedia.</li>
                    <li>Sistem akan mendeteksi apakah email tersebut sudah terdaftar. Jika belum, Anda akan diarahkan untuk Setup Passkey.</li>
                    <li>Browser akan memunculkan prompt otentikasi bawaan OS (misalnya Windows Hello, Touch ID, atau Face ID). Ikuti petunjuk di layar untuk memindai sidik jari atau wajah Anda.</li>
                    <li>Setelah sukses, kredensial FIDO2 Anda akan tersimpan secara aman di perangkat. Anda akan secara instan diarahkan ke Dashboard.</li>
                    <li>Untuk Login di waktu berikutnya, Anda hanya perlu memasukkan email dan menggunakan sensor biometrik yang sama.</li>
                  </ol>
                </div>

                <div id="how-to-simulate" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Cara Menjalankan Simulasi Keamanan</h2>
                  <p className="text-gray-400">Simulasi memungkinkan Anda untuk menguji ketahanan WebAuthn dari sudut pandang penyerang (Attacker Perspective).</p>
                  <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
                    <li>Pergi ke halaman **Dashboard** melalui navigasi d! atas.</li>
                    <li>Pilih tab <span className="text-red-400 font-medium text-sm">Security Analysis</span>.</li>
                    <li>Gulir ke bawah ke bagian "Attack Simulation Engine".</li>
                    <li>Pilih Tipe Serangan (Phishing, Credential Stuffing, Brute Force, atau MitM).</li>
                    <li>Tentukan Target Method (WebAuthn atau Legacy/Password) lalu tekan tombol "Execute Simulation".</li>
                    <li>Sistem akan menguji algoritma serangan nyata terhadap infrastruktur dan memberikan hasil probabilitas kegagalan/keberhasilan serangan. Serangan ini juga akan dicatat di dalam Log Keamanan utama.</li>
                  </ol>
                </div>

                <div id="how-to-survey" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Cara Mengisi Survei UX (Data Intake)</h2>
                  <p className="text-gray-400">Kami mengumpulkan data kenyamanan pengguna melalui antarmuka Form Survei bawaan.</p>
                  <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
                    <li>Kunjungi URL <code>/ux-form</code> secara langsung pada browser Anda.</li>
                    <li>Isi 10 pertanyaan standar System Usability Scale (SUS) berformat skala likert (Sangat Tidak Setuju hingga Sangat Setuju).</li>
                    <li>Berikan rating "Beban Kognitif / Mental Effort" yang Anda rasakan selama menggunakan passkey.</li>
                    <li>Isi data Demografi (Umur, Tingkat keahlian teknologi) agar dashboard perbandingan dapat menyesuaikan distribusi pengguna.</li>
                    <li>Klik Kirim. Data akan langsung terintegrasi secara real-time ke dalam tab Dashboard "UX & Usability Research".</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Metodologi Analisis */}
            {activeSection === 'methodology' && (
              <div id="methodology" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold">
                    <BarChart3 className="w-3 h-3" />
                    How It Works
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Analysis Methodology</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Bagaimana metrik Dashboard dihitung di belakang layar menggunakan data nyata dari koleksi database MongoDB.
                  </p>
                </div>

                <div id="security-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Perhitungan Keamanan & Serangan</h2>
                  <p className="text-gray-400">Nilai keamanan pada Dashboard tidak bersifat statis/hardcoded. Skor tersebut merefleksikan catatan riwayat asli di dalam `AuthLog` dan Engine Simulasi.</p>
                  <ul className="list-disc list-inside text-gray-400 space-y-3 mt-4">
                    <li>**Ketahanan Terhadap Phishing (Phishing Resistance):** Skor WebAuthn selalu dijaga di level tinggi berkat *Domain Binding Algorithm*, namun akan terkena beban penalti jika ada error teknis log. Skor Password dihitung berdasarkan formula asimtotik: <code>Math.max(5, 30 - FailureRate * 100)</code> yang dengan drastis menurunkan keamanan Password ketika rasio kesalahan login meningkat.</li>
                    <li>**Simulasi Serangan Cyber:** Mesin tidak memalsukan data. Node.js backend secara literal mengeksekusi payload simulasi, memproses logic asimetrik key, dan jika gagal (karena WebAuthn tidak memberikan respons kepada domain yang dicurigai), ia akan mencatatnya ke dalam database sebagai "Blocked Incident".</li>
                  </ul>
                </div>

                <div id="performance-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Metrik Performa (Latensi & Ukuran Payload)</h2>
                  <p className="text-gray-400">Setiap request API saat pengguna melakukan login atau register akan disela (intercept) oleh Middleware Backend untuk menghitung metrik jaringan secara presisi.</p>
                  <ul className="list-disc list-inside text-gray-400 space-y-3 mt-4">
                    <li>**Waktu Eksekusi (Duration/Latency):** Diukur langsung semenjak request masuk di router Express hingga JSON response dikirim (menggunakan selisih <code>Date.now()</code> lokal). Data ini tersimpan di `PerformanceLog`.</li>
                    <li>**Besaran Transmisi (Payload Size):** Sistem mengukur ukuran bytes asli menggunakan metode kalkulasi String Length berbasis JSON Stringify untuk memvalidasi klaim penelitian bahwa payload WebAuthn umumnya lebih besar dibandingkan Password Auth karena memuat Public-Key Attestation Object yang panjang.</li>
                  </ul>
                </div>

                <div id="ux-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Kalkulasi Skor System Usability Scale (SUS)</h2>
                  <p className="text-gray-400">Form UX yang dihimpun divalidasi dan dihitung menggunakan rumus SUS Industri Akademik standar.</p>
                  <div className="p-4 bg-black/50 border border-white/10 rounded-lg overflow-x-auto font-mono text-sm text-gray-300 my-4">
                    <p>// Formula Kalkulasi Agregasi Skala SUS</p>
                    <p>Skor Item Ganjil = (Skala Pengguna) - 1</p>
                    <p>Skor Item Genap = 5 - (Skala Pengguna)</p>
                    <p>Total Skor SUS Akhir = (Total Skor Ganjil + Total Skor Genap) * 2.5</p>
                  </div>
                  <p className="text-gray-400">Hasil ini kemudian diagregasi dan menjadi dasar di tab "UX & Usability Research" guna menyimpulkan skor A, B, C, D atau F atas kenyamanan (Learnability) fitur WebAuthn.</p>
                </div>
              </div>
            )}

            {/* API Reference */}
            {activeSection === 'api' && (
              <div id="api" className="space-y-10 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/[0.08] border border-red-500/20 rounded-full text-red-400 text-xs font-semibold">
                    <Code className="w-3 h-3" />
                    Reference
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">API Reference</h1>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Daftar referensi lengkap rute endpoint backend.
                  </p>
                </div>

                <div id="endpoints" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Daftar Modul Router</h2>
                  <p className="text-gray-400">Server mengorganisir endpoint ke dalam modul-modul berikut:</p>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li><code>/api/auth/*</code> - Alur Utama WebAuthn API</li>
                    <li><code>/api/stats/*</code> - Analitik Data Agregat Dashboard</li>
                    <li><code>/api/security/*</code> - Verifikasi Serangan Siber dan Metrik</li>
                    <li><code>/api/ux/*</code> - Penyerapan Studi Kuisioner Pengguna</li>
                    <li><code>/api/user/*</code> - Manajemen Profile Pengguna Pribadi</li>
                  </ul>
                </div>

                <div id="auth-api" className="space-y-4 pt-8 border-t border-white/[0.06]">
                  <h2 className="text-xl font-bold text-white">Auth API</h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded mr-3">POST</span>
                        <code className="text-gray-300">/api/auth/webauthn/register/options</code>
                      </div>
                      <span className="text-sm text-gray-500">Menghasilkan Challenge untuk Pendaftaran</span>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded mr-3">POST</span>
                        <code className="text-gray-300">/api/auth/webauthn/login/verify</code>
                      </div>
                      <span className="text-sm text-gray-500">Validasi Kriptografi Kunci FIDO2</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white">Stats API</h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded mr-3">GET</span>
                        <code className="text-gray-300">/api/stats/global-stats</code>
                      </div>
                      <span className="text-sm text-gray-500">Data AuthLog Keseluruhan</span>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded mr-3">GET</span>
                        <code className="text-gray-300">/api/stats/comparison-data</code>
                      </div>
                      <span className="text-sm text-gray-500">Agregasi Lengkap WebAuthn vs. Legacy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar (Table of Contents) */}
          {currentOnPage.length > 0 && (
            <aside className="hidden xl:block w-64 pt-10 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <div className="px-6">
                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">On this page</h5>
                <nav className="space-y-3">
                  {currentOnPage.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          const headerOffset = 80;
                          const elementPosition = element.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                      }}
                      className={`block text-xs font-medium transition-colors ${
                        activeOnPage === item.id ? 'text-blue-400' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
                
                <div className="mt-8 pt-8 border-t border-white/[0.08]">
                  <a 
                    href="https://github.com/IchwanArdi/PasskeyStudy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Edit this page on GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
};

export default Documentation;
