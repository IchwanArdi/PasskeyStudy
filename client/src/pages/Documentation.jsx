import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { BookOpen, Settings, Lock, Shield, Key, BarChart3, Code, Menu, X, Search, Github, ChevronRight, ChevronDown } from 'lucide-react';

const Documentation = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOnPage, setActiveOnPage] = useState('usage');

  useEffect(() => {
    // Scroll to section when activeSection changes
    const element = document.getElementById(activeSection);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, [activeSection]);

  // Intersection Observer untuk update activeOnPage saat scroll
  useEffect(() => {
    const currentOnPage = onPageSections[activeSection] || onPageSections.introduction;

    if (currentOnPage.length === 0) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    };

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

    // Observe semua section yang ada di currentOnPage
    currentOnPage.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [activeSection]);

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: 'BookOpen' },
    { id: 'installation', title: 'Installation', icon: 'Settings' },
    { id: 'authentication', title: 'Authentication', icon: 'Lock' },
    { id: 'webauthn', title: 'WebAuthn / FIDO2', icon: 'Shield' },
    { id: 'password', title: 'Password Auth', icon: 'Key' },
    { id: 'dashboard', title: 'Dashboard', icon: 'BarChart' },
    { id: 'api', title: 'API Reference', icon: 'Code' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      BookOpen: <BookOpen className="w-5 h-5" />,
      Settings: <Settings className="w-5 h-5" />,
      Lock: <Lock className="w-5 h-5" />,
      Shield: <Shield className="w-5 h-5" />,
      Key: <Key className="w-5 h-5" />,
      BarChart: <BarChart3 className="w-5 h-5" />,
      Code: <Code className="w-5 h-5" />,
    };
    return icons[iconName] || null;
  };

  const onPageSections = {
    introduction: [
      { id: 'overview', title: 'Overview' },
      { id: 'features', title: 'Features' },
      { id: 'getting-started', title: 'Getting Started' },
    ],
    installation: [
      { id: 'requirements', title: 'Requirements' },
      { id: 'setup', title: 'Setup' },
      { id: 'configuration', title: 'Configuration' },
    ],
    authentication: [
      { id: 'usage', title: 'Usage' },
      { id: 'examples', title: 'Examples' },
      { id: 'best-practices', title: 'Best Practices' },
    ],
    webauthn: [],
    password: [],
    dashboard: [],
    api: [],
  };

  const currentOnPage = onPageSections[activeSection] || onPageSections.introduction;

  // Reset activeOnPage saat activeSection berubah
  useEffect(() => {
    const current = onPageSections[activeSection] || onPageSections.introduction;
    if (current.length > 0) {
      // Delay sedikit untuk memastikan element sudah di-render
      setTimeout(() => {
        setActiveOnPage(current[0].id);
      }, 100);
    } else {
      setActiveOnPage('');
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Left Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} fixed left-0 top-0 bottom-0 bg-[#0f0f0f] border-r border-gray-800 overflow-hidden transition-all duration-300 z-40 flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className={`flex items-center gap-2 text-white font-semibold hover:text-gray-300 transition-colors ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              <Lock className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm">WebAuthn Research</span>}
            </Link>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Button when collapsed */}
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="w-full mb-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded" title="Buka sidebar">
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search */}
          {sidebarOpen && (
            <div className="mb-6 flex items-center gap-2 px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:border-gray-700 transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Cari</span>
              <span className="ml-auto px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl K</span>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {sidebarOpen && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Dokumentasi</div>
              </div>
            )}
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-2' : 'justify-center px-2'} py-1.5 rounded text-sm transition-colors ${
                  activeSection === section.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
                title={sidebarOpen ? '' : section.title}
              >
                <span className="shrink-0">{getIcon(section.icon)}</span>
                {sidebarOpen && <span>{section.title}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <a href="#" className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded`} title={sidebarOpen ? '' : 'GitHub'}>
            <Github className="w-5 h-5 shrink-0" />
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded">
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Dokumentasi</span>
                <span className="text-gray-600">/</span>
                <span className="text-sm font-semibold capitalize">{activeSection}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:border-gray-700 transition-all cursor-pointer">
                <Search className="w-3.5 h-3.5" />
                <span>Cari</span>
                <span className="ml-1.5 px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl K</span>
              </div>
              <a href="#" className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-all" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              {authenticated ? (
                <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
                  Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
                    Masuk
                  </Link>
                  <Link to="/register" className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
                    Mulai
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
          {/* Main Documentation */}
          <div className="flex-1 max-w-3xl">
            {/* Introduction Section */}
            {activeSection === 'introduction' && (
              <div id="introduction">
                <h1 className="text-4xl font-bold mb-2">Introduction</h1>
                <p className="text-xl text-gray-400 mb-8">Sistem autentikasi passwordless untuk aplikasi web modern</p>

                <div id="overview" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                  <p className="text-gray-300 mb-4">
                    WebAuthn Research adalah implementasi sistem autentikasi passwordless menggunakan standar WebAuthn/FIDO2 pada aplikasi web fullstack JavaScript. Project ini dirancang untuk membandingkan metode autentikasi tradisional
                    (password) dengan metode modern (WebAuthn/FIDO2).
                  </p>
                  <p className="text-gray-300 mb-4">
                    WebAuthn (Web Authentication) adalah standar W3C yang memungkinkan pengguna untuk melakukan autentikasi menggunakan cryptographic keys yang tersimpan di device mereka, seperti Touch ID, Face ID, Windows Hello, atau
                    security keys seperti YubiKey.
                  </p>
                </div>

                <div id="features" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Features</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Autentikasi WebAuthn/FIDO2 dengan dukungan platform authenticators dan cross-platform keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Autentikasi password tradisional sebagai pembanding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Dashboard analitik untuk monitoring dan perbandingan performa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Logging lengkap untuk analisis keamanan dan performa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>User experience tracking dan feedback system</span>
                    </li>
                  </ul>
                </div>

                <div id="getting-started" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                  <p className="text-gray-300 mb-4">Untuk memulai menggunakan aplikasi ini, Anda perlu melakukan registrasi terlebih dahulu. Setelah registrasi, Anda dapat memilih metode autentikasi yang ingin digunakan.</p>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-400">1. Registrasi</span>
                    </div>
                    <p className="text-sm text-gray-300">Daftar dengan email dan username Anda</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-400">2. Pilih Metode Autentikasi</span>
                    </div>
                    <p className="text-sm text-gray-300">Pilih antara Password atau WebAuthn untuk registrasi</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-400">3. Akses Dashboard</span>
                    </div>
                    <p className="text-sm text-gray-300">Setelah login, akses dashboard untuk melihat statistik dan analisis</p>
                  </div>
                </div>
              </div>
            )}

            {/* Installation Section */}
            {activeSection === 'installation' && (
              <div id="installation">
                <h1 className="text-4xl font-bold mb-2">Installation</h1>
                <p className="text-xl text-gray-400 mb-8">Panduan instalasi dan setup project</p>

                <div id="requirements" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Node.js v18 atau lebih tinggi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>MongoDB database</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Browser modern dengan dukungan WebAuthn (Chrome, Firefox, Edge, Safari)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>HTTPS untuk production (WebAuthn memerlukan secure context)</span>
                    </li>
                  </ul>
                </div>

                <div id="setup" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Setup</h2>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Terminal</span>
                      <button className="text-xs text-gray-500 hover:text-gray-300">Copy</button>
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{`# Clone repository
git clone <repository-url>
cd webauthn-passwordless-demo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env`}</code>
                    </pre>
                  </div>
                </div>

                <div id="configuration" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
                  <p className="text-gray-300 mb-4">
                    Konfigurasi environment variables di file <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sm">.env</code>:
                  </p>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{`MONGODB_URI=mongodb://localhost:27017/webauthn-demo
JWT_SECRET=your-secret-key
PORT=5000
RP_ID=localhost
RP_NAME=WebAuthn Research
ORIGIN=http://localhost:5173`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Section */}
            {activeSection === 'authentication' && (
              <div id="authentication">
                <h1 className="text-4xl font-bold mb-2">Authentication</h1>
                <p className="text-xl text-gray-400 mb-8">Panduan penggunaan sistem autentikasi</p>

                <div id="usage" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Usage</h2>
                  <p className="text-gray-300 mb-4">Aplikasi ini mendukung dua metode autentikasi: Password tradisional dan WebAuthn/FIDO2. Anda dapat memilih salah satu atau menggunakan keduanya.</p>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Registrasi dengan Password</span>
                    </div>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                      <li>Masuk ke halaman Register</li>
                      <li>Pilih tab "Password"</li>
                      <li>Isi email, username, dan password</li>
                      <li>Klik "Register"</li>
                    </ol>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Registrasi dengan WebAuthn</span>
                    </div>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                      <li>Masuk ke halaman Register</li>
                      <li>Pilih tab "WebAuthn / FIDO2"</li>
                      <li>Isi email dan username</li>
                      <li>Klik "Register" dan ikuti prompt authenticator (Touch ID, Face ID, dll)</li>
                    </ol>
                  </div>
                </div>

                <div id="examples" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Examples</h2>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Login dengan Password</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">1. Masuk ke halaman Login</p>
                      <p className="mb-2">2. Pilih tab "Password"</p>
                      <p className="mb-2">3. Masukkan email dan password</p>
                      <p>4. Klik "Login"</p>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Login dengan WebAuthn</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">1. Masuk ke halaman Login</p>
                      <p className="mb-2">2. Pilih tab "WebAuthn / FIDO2"</p>
                      <p className="mb-2">3. Masukkan email</p>
                      <p>4. Klik "Login" dan ikuti prompt authenticator</p>
                    </div>
                  </div>
                </div>

                <div id="best-practices" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Gunakan HTTPS di production untuk WebAuthn (required untuk secure context)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Pastikan RP_ID sesuai dengan domain aplikasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Simpan credential counter dengan benar untuk mencegah replay attacks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Implementasikan fallback method jika WebAuthn tidak tersedia</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* WebAuthn Section */}
            {activeSection === 'webauthn' && (
              <div id="webauthn">
                <h1 className="text-4xl font-bold mb-2">WebAuthn / FIDO2</h1>
                <p className="text-xl text-gray-400 mb-8">Implementasi autentikasi passwordless</p>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Apa itu WebAuthn?</h2>
                  <p className="text-gray-300 mb-4">
                    WebAuthn (Web Authentication) adalah standar W3C yang memungkinkan aplikasi web untuk melakukan autentikasi menggunakan cryptographic keys yang tersimpan di device pengguna, bukan password.
                  </p>
                  <p className="text-gray-300 mb-4">WebAuthn adalah bagian dari spesifikasi FIDO2 (Fast IDentity Online 2) yang dikembangkan oleh FIDO Alliance.</p>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Keuntungan WebAuthn</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>
                        <strong>Keamanan Tinggi:</strong> Tidak ada password yang bisa dicuri atau di-hack
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>
                        <strong>Proteksi Phishing:</strong> Credential terikat dengan origin, tidak bisa digunakan di situs lain
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>
                        <strong>User Experience:</strong> Login cepat dengan Touch ID, Face ID, atau Windows Hello
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>
                        <strong>No Password Storage:</strong> Server tidak menyimpan password, mengurangi risiko data breach
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Cara Kerja</h2>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-300 space-y-3">
                      <div>
                        <strong className="text-white">1. Registration:</strong>
                        <p className="mt-1">User membuat credential baru dengan authenticator (Touch ID, Face ID, dll)</p>
                      </div>
                      <div>
                        <strong className="text-white">2. Storage:</strong>
                        <p className="mt-1">Public key disimpan di server, private key tetap di device user</p>
                      </div>
                      <div>
                        <strong className="text-white">3. Authentication:</strong>
                        <p className="mt-1">User membuktikan kepemilikan private key dengan signature</p>
                      </div>
                      <div>
                        <strong className="text-white">4. Verification:</strong>
                        <p className="mt-1">Server memverifikasi signature menggunakan public key yang tersimpan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Auth Section */}
            {activeSection === 'password' && (
              <div id="password">
                <h1 className="text-4xl font-bold mb-2">Password Authentication</h1>
                <p className="text-xl text-gray-400 mb-8">Autentikasi tradisional sebagai pembanding</p>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Implementasi</h2>
                  <p className="text-gray-300 mb-4">
                    Password authentication menggunakan bcrypt untuk hashing password sebelum disimpan di database. Ini adalah metode autentikasi tradisional yang digunakan sebagai pembanding untuk WebAuthn.
                  </p>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Keamanan</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Password di-hash menggunakan bcrypt dengan salt rounds 10</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Rentan terhadap phishing dan brute force attacks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>User cenderung menggunakan password yang lemah atau reuse password</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div id="dashboard">
                <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                <p className="text-xl text-gray-400 mb-8">Analitik dan monitoring sistem autentikasi</p>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Fitur Dashboard</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Statistik autentikasi (total attempts, success rate, average duration)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Perbandingan visual antara Password dan WebAuthn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Activity over time chart (30 hari terakhir)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Recent login attempts log</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Export data ke CSV</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">View Modes</h2>
                  <p className="text-gray-300 mb-4">Dashboard memiliki dua mode tampilan:</p>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Global Stats:</strong>
                      <p className="mt-1">Menampilkan statistik dari semua user dalam sistem</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">My Stats:</strong>
                      <p className="mt-1">Menampilkan statistik khusus untuk user yang sedang login</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference Section */}
            {activeSection === 'api' && (
              <div id="api">
                <h1 className="text-4xl font-bold mb-2">API Reference</h1>
                <p className="text-xl text-gray-400 mb-8">Dokumentasi endpoint API</p>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Authentication Endpoints</h2>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">POST</span>
                      <code className="text-sm text-gray-300">/api/auth/register</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Registrasi user baru</p>
                    <div className="text-xs text-gray-500">Body: {`{ email, username, password? }`}</div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">POST</span>
                      <code className="text-sm text-gray-300">/api/auth/login</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Login dengan password</p>
                    <div className="text-xs text-gray-500">Body: {`{ email, password }`}</div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">GET</span>
                      <code className="text-sm text-gray-300">/api/webauthn/register-options</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Mendapatkan options untuk WebAuthn registration</p>
                    <div className="text-xs text-gray-500">Query: {`{ email, username }`}</div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">GET</span>
                      <code className="text-sm text-gray-300">/api/webauthn/login-options</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Mendapatkan options untuk WebAuthn login</p>
                    <div className="text-xs text-gray-500">Query: {`{ email }`}</div>
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Stats Endpoints</h2>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">GET</span>
                      <code className="text-sm text-gray-300">/api/stats/my-stats</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Mendapatkan statistik user yang sedang login</p>
                    <div className="text-xs text-gray-500">Headers: Authorization Bearer token</div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">GET</span>
                      <code className="text-sm text-gray-300">/api/stats/global-stats</code>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Mendapatkan statistik global dari semua user</p>
                    <div className="text-xs text-gray-500">Headers: Authorization Bearer token</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - On This Page */}
          {currentOnPage.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    On this page
                  </h3>
                  <nav className="space-y-1">
                    {currentOnPage.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveOnPage(item.id);
                          const element = document.getElementById(item.id);
                          if (element) {
                            const headerOffset = 80;
                            const elementPosition = element.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth',
                            });
                          }
                        }}
                        className={`block px-2 py-1.5 text-sm rounded transition-colors ${activeOnPage === item.id ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documentation;
