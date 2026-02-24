import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import {
  Github,
  Shield,
  ArrowRight,
  Fingerprint,
  Activity,
  Zap,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      {!authenticated && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link
                to="/"
                className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center gap-2.5"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <span className="truncate">WebAuthn Research</span>
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  to="/docs"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Dokumentasi
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="https://github.com/IchwanArdi/PasskeyStudy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium px-4 py-2"
                >
                  Masuk
                </Link>
              </div>
              <Link
                to="/register"
                className="hidden sm:flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                Mulai Sekarang
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          <div className={`
            lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0f] border-b border-white/[0.06] transition-all duration-300 overflow-hidden
            ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}
          `}>
            <div className="px-6 flex flex-col gap-4">
              <Link to="/docs" className="text-gray-400 hover:text-white py-2 text-sm font-medium border-b border-white/[0.03]">Dokumentasi</Link>
              <Link to="/login" className="text-gray-400 hover:text-white py-2 text-sm font-medium border-b border-white/[0.03]">Masuk</Link>
              <Link to="/register" className="text-blue-400 py-2 text-sm font-semibold">Daftar Sekarang</Link>
              <div className="pt-2 flex items-center gap-4">
                <a href="https://github.com/IchwanArdi/PasskeyStudy" className="flex items-center gap-2 text-gray-500 text-xs">
                  <Github className="w-4 h-4" /> Repository
                </a>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-[10px] sm:text-xs font-semibold tracking-wide mb-6 sm:mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Riset Autentikasi Next-Gen
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.2] sm:leading-[1.1]">
            Evolusi{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Identitas Digital.
            </span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Studi empiris tentang ketahanan WebAuthn dan FIDO2. Implementasi
            keamanan biometrik untuk mengeliminasi kerentanan berbasis password.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
            {!authenticated ? (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  Mulai Penelitian <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/docs"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/[0.04] border border-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/[0.08] hover:border-white/15 transition-all text-center"
                >
                  Baca Dokumentasi
                </Link>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20"
              >
                Buka Dashboard <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-20 sm:mt-32 w-full px-4">
          <div className="glass-card rounded-2xl p-6 sm:p-8 hover:border-blue-500/20 transition-all duration-300 group glow-blue-hover">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-blue-500/15 transition-colors">
              <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Presisi Biometrik</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Implementasi kriptografi kunci publik berbasis hardware untuk
              memverifikasi identitas tanpa berbagi data sensitif.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8 hover:border-purple-500/20 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 border border-purple-500/15 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-purple-500/15 transition-colors">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Analisis Risiko</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Analisis pola perilaku secara real-time untuk mendeteksi dan
              memitigasi upaya phishing yang canggih.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8 hover:border-emerald-500/20 transition-all duration-300 group sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-emerald-500/15 transition-colors">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Latensi Instan</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Alur onboarding tanpa hambatan yang dirancang untuk mengungguli
              sistem password tradisional dalam kecepatan.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-16 sm:py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group p-4 sm:p-6 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 sm:mb-3">
                99.9%
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 group-hover:text-blue-400 uppercase tracking-widest transition-colors">
                Ketahanan Phishing
              </span>
            </div>
            <div className="text-center group p-4 sm:p-6 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 sm:mb-3">
                Zero
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 group-hover:text-blue-400 uppercase tracking-widest transition-colors">
                Shared Secrets
              </span>
            </div>
            <div className="text-center group p-4 sm:p-6 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 sm:mb-3">
                W3C
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 group-hover:text-blue-400 uppercase tracking-widest transition-colors">
                Standar Tersertifikasi
              </span>
            </div>
            <div className="text-center group p-4 sm:p-6 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05]">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 sm:mb-3">
                FIDO2
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 group-hover:text-blue-400 uppercase tracking-widest transition-colors">
                Stack Terstandardisasi
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/[0.04] text-center">
        <p className="text-xs text-gray-600 font-medium">
          © {new Date().getFullYear()} WebAuthn Academic Research Framework
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
