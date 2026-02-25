import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Settings, Lock, Shield, Key, BarChart3, Code, Menu, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { isAuthenticated, clearAuth } from '../utils/auth';

// Modular Section Components
import IntroductionSection from './docs/IntroductionSection';
import InstallationSection from './docs/InstallationSection';
import UserGuideSection from './docs/UserGuideSection';
import AuthenticationSection from './docs/AuthenticationSection';
import WebAuthnSection from './docs/WebAuthnSection';
import PasswordSection from './docs/PasswordSection';
import ThreatModelSection from './docs/ThreatModelSection';
import FidoComparisonSection from './docs/FidoComparisonSection';
import LimitationsSection from './docs/LimitationsSection';
import DashboardSection from './docs/DashboardSection';
import CostAnalysisSection from './docs/CostAnalysisSection';
import CompatibilitySection from './docs/CompatibilitySection';
import MethodologySection from './docs/MethodologySection';
import ApiReferenceSection from './docs/ApiReferenceSection';

const sections = [
  { 
    group: 'Memulai',
    items: [
      { id: 'introduction', title: 'Pendahuluan', icon: BookOpen },
      { id: 'installation', title: 'Instalasi', icon: Settings },
      { id: 'user-guide', title: 'Panduan Pengguna', icon: BookOpen },
    ]
  },
  {
    group: 'Konsep Inti',
    items: [
      { id: 'authentication', title: 'Alur Autentikasi', icon: Lock },
      { id: 'webauthn', title: 'WebAuthn / FIDO2', icon: Shield },
      { id: 'password', title: 'Sistem Password', icon: Key },
    ]
  },
  {
    group: 'Keamanan',
    items: [
      { id: 'threat-model', title: 'Model Ancaman', icon: Shield },
      { id: 'fido-comparison', title: 'Perbandingan FIDO', icon: Shield },
      { id: 'limitations', title: 'Kelemahan & Limitasi', icon: AlertTriangle },
    ]
  },
  {
    group: 'Analitik',
    items: [
      { id: 'dashboard', title: 'Dashboard & Metrik', icon: BarChart3 },
      { id: 'cost-analysis', title: 'Analisis Biaya', icon: BarChart3 },
      { id: 'compatibility', title: 'Kompatibilitas', icon: Settings },
      { id: 'methodology', title: 'Metodologi', icon: BarChart3 },
    ]
  },
  {
    group: 'Referensi',
    items: [
      { id: 'api', title: 'API Reference', icon: Code },
    ]
  }
];

const onPageSections = {
  introduction: [
    { id: 'overview', title: 'Latar Belakang' },
    { id: 'features', title: 'Kapabilitas Utama' },
    { id: 'getting-started', title: 'Arsitektur Teknologi' },
  ],
  installation: [
    { id: 'requirements', title: 'Persyaratan Sistem' },
    { id: 'setup', title: 'Langkah Instalasi' },
    { id: 'configuration', title: 'Konfigurasi Environment' },
  ],
  'user-guide': [
    { id: 'how-to-register', title: 'Cara Mendaftar & Login' },
    { id: 'how-to-manage', title: 'Cara Mengelola Perangkat' },
    { id: 'how-to-simulate', title: 'Cara Menjalankan Simulasi' },
    { id: 'how-to-survey', title: 'Cara Mengisi Survei UX' },
  ],
  authentication: [
    { id: 'flow', title: 'Alur Registrasi & Login' },
    { id: 'architecture', title: 'Arsitektur Kunci Publik' },
  ],
  webauthn: [
    { id: 'registration', title: 'Registrasi Kredensial' },
    { id: 'login', title: 'Verifikasi Login' },
    { id: 'security', title: 'Keamanan Kriptografi' },
  ],
  password: [
    { id: 'legacy', title: 'Arsitektur Shared-Secret' },
    { id: 'baseline', title: 'Data Baseline' },
  ],
  'threat-model': [
    { id: 'stride', title: 'Analisis STRIDE' },
    { id: 'mitigations', title: 'Vektor Serangan & Mitigasi' },
    { id: 'recovery-security', title: 'Keamanan Pemulihan' },
  ],
  'fido-comparison': [
    { id: 'evolution', title: 'Evolusi Standar' },
    { id: 'comparison-table', title: 'Tabel Perbandingan' },
    { id: 'fido2-architecture', title: 'Arsitektur FIDO2' },
  ],
  limitations: [
    { id: 'hardware-dep', title: 'Ketergantungan Hardware' },
    { id: 'recovery-challenge', title: 'Kompleksitas Pemulihan' },
    { id: 'adoption-barriers', title: 'Hambatan Adopsi' },
    { id: 'technical-limits', title: 'Keterbatasan Teknis' },
  ],
  dashboard: [
    { id: 'overview', title: 'Arsitektur Dashboard' },
    { id: 'metrics', title: 'Metrik Perbandingan' },
  ],
  'cost-analysis': [
    { id: 'implementation', title: 'Biaya Implementasi (Capex)' },
    { id: 'operational', title: 'Biaya Operasional (Opex)' },
    { id: 'roi', title: 'Return on Investment' },
  ],
  compatibility: [
    { id: 'browser', title: 'Dukungan Browser' },
    { id: 'device', title: 'Dukungan Perangkat' },
    { id: 'accessibility', title: 'Aksesibilitas (WCAG)' },
  ],
  methodology: [
    { id: 'security-math', title: 'Perhitungan Keamanan' },
    { id: 'performance-math', title: 'Metrik Performa' },
    { id: 'ux-math', title: 'Kalkulasi SUS' },
  ],
  api: [
    { id: 'endpoints', title: 'Ringkasan Modul' },
    { id: 'auth-api', title: 'Auth API' },
    { id: 'stats-api', title: 'Stats API' },
  ],
};

const sectionComponents = {
  introduction: IntroductionSection,
  installation: InstallationSection,
  'user-guide': UserGuideSection,
  authentication: AuthenticationSection,
  webauthn: WebAuthnSection,
  password: PasswordSection,
  'threat-model': ThreatModelSection,
  'fido-comparison': FidoComparisonSection,
  limitations: LimitationsSection,
  dashboard: DashboardSection,
  'cost-analysis': CostAnalysisSection,
  compatibility: CompatibilitySection,
  methodology: MethodologySection,
  api: ApiReferenceSection,
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOnPage, setActiveOnPage] = useState('overview');

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const ActiveComponent = sectionComponents[activeSection] || IntroductionSection;

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
            <div className="mb-8 p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Research Docs</div>
                  <div className="text-xs font-semibold">v2.0.0</div>
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
            
            <ActiveComponent />
          </div>

          {/* Right Sidebar (Table of Contents) */}
          {currentOnPage.length > 0 && (
            <aside className="hidden xl:block w-64 pt-10 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <div className="px-6">
                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Di halaman ini</h5>
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
                    Edit di GitHub <ExternalLink className="w-3 h-3" />
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
