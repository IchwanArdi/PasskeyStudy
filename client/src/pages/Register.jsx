import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebAuthnAuth from '../components/WebAuthnAuth';
import { toast } from 'react-toastify';
import { Shield, Github, Fingerprint, CheckCircle, Search, Download, Copy } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  const handleSuccess = async () => {
    toast.success('Registrasi berhasil!');

    // Try to generate recovery codes after registration
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/recovery/generate-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.codes && data.codes.length > 0) {
          setRecoveryCodes(data.codes);
          setShowRecoveryCodes(true);
          return; // Don't navigate yet, show codes first
        }
      }
    } catch (err) {
      console.warn('Recovery codes not generated:', err);
    }

    navigate('/dashboard');
  };

  const handleDismissCodes = () => {
    setShowRecoveryCodes(false);
    navigate('/dashboard');
  };

  const handleCopyCodes = () => {
    const text = recoveryCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Recovery codes disalin ke clipboard');
  };

  const handleDownloadCodes = () => {
    const text = `WebAuthn Research — Recovery Codes\nGenerated: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(40)}\n\n${recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\n${'='.repeat(40)}\nSimpan kode ini di tempat yang aman.\nSetiap kode hanya dapat digunakan satu kali.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webauthn-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File recovery codes berhasil diunduh');
  };

  // Show recovery codes after registration
  if (showRecoveryCodes) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans flex items-center justify-center px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 grid-bg mask-radial opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-xl animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">Account Created</h1>
            <p className="text-gray-400 text-sm">Save these recovery codes in a secure place</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8">
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">⚠ Warning</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                These codes are the <b>only way</b> to recover your account if you lose your device. Each code can only be used once.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-8">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center font-mono text-xs tracking-widest text-white/80">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleCopyCodes}
                className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-3 h-3" /> Copy All
              </button>
              <button
                onClick={handleDownloadCodes}
                className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>

            <button
              onClick={handleDismissCodes}
              className="w-full px-6 py-4 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
            >
              I've saved them → Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid-bg mask-radial opacity-20" />
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
              <Link to="/docs" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Docs</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">About</Link>
              <a href="https://github.com/IchwanArdi/PasskeyStudy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">GitHub</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Create Account</h1>
            <p className="text-gray-400 text-sm">Join the passwordless revolution</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8">
              <Shield className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Your account is secured by <span className="text-white font-semibold">public key cryptography</span>. No passwords, ever.
              </p>
            </div>

            <WebAuthnAuth mode="register" onSuccess={handleSuccess} />

            <div className="mt-10 pt-6 border-t border-white/[0.08] text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:underline transition-colors font-semibold">
                  Log In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
