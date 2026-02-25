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
  X,
  Copy,
  Check,
  Search
} from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx create-webauthn-app@latest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid-bg mask-radial opacity-20" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white/[0.03] rounded-full blur-[120px]" />
      </div>

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
            {!authenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-md text-gray-500 text-xs font-mono">
                  Search docs... <span className="bg-white/10 px-1 rounded text-[10px]">Ctrl K</span>
                </div>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium px-2">Log In</Link>
                <Link
                  to="/register"
                  className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white/[0.05] border border-white/10 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-none animate-fade-in-up">
            The Biometric <br />
            <span className="text-white/40">Identity Framework</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Eliminating passwords with high-quality <span className="text-white font-medium">WebAuthn implementations</span>. 
            Empowering developers with the power of FIDO2 components.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {!authenticated ? (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-lg font-bold text-base hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                >
                  Get Started
                </button>
                <Link
                  to="/docs"
                  className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 text-white rounded-lg font-bold text-base hover:bg-white/5 transition-all text-center"
                >
                  Learn WebAuthn
                </Link>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-lg font-bold text-base hover:bg-gray-200 transition-all"
              >
                Go to Dashboard
              </button>
            )}
          </div>

          {/* Command Prompt style snippet */}
          <div 
            onClick={copyCommand}
            className="group relative cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <span className="text-sm font-mono flex items-center gap-2">
              <span className="text-white/40">▲</span> ~ npx create-webauthn-app@latest
            </span>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
        </div>
      </section>

        {/* Feature Grid */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-1 px-4 mt-20 border-y border-white/[0.08]">
          <div className="p-8 md:p-12 border-x border-white/[0.08] hover:bg-white/[0.02] transition-colors">
            <h3 className="text-xl font-bold mb-4">Biometric Precision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Implementation of hardware-backed public key cryptography to verify identity without sharing sensitive data.
            </p>
          </div>

          <div className="p-8 md:p-12 border-x border-white/[0.08] hover:bg-white/[0.02] transition-colors">
            <h3 className="text-xl font-bold mb-4">Risk Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time behavior pattern analysis to detect and mitigate sophisticated phishing attempts.
            </p>
          </div>

          <div className="p-8 md:p-12 border-x border-white/[0.08] hover:bg-white/[0.02] transition-colors">
            <h3 className="text-xl font-bold mb-4">Instant Latency</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Seamless onboarding flows designed to outperform traditional password systems in speed and efficiency.
            </p>
          </div>
        </div>
      {/* Trust Stats */}
      <section className="relative z-10 py-24 px-6 bg-black border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="block text-4xl font-black text-white mb-2">99.9%</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phishing Resistant</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-black text-white mb-2">Zero</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Shared Secrets</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-black text-white mb-2">W3C</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Certified Standard</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-black text-white mb-2">FIDO2</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Stack</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 border-t border-white/[0.08] text-center bg-black">
        <p className="text-xs text-gray-500 font-medium tracking-tight">
          © {new Date().getFullYear()} WebAuthn Academic Research Framework. Built for the modern web.
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
