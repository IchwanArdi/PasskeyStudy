import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * InstallAppBanner — Menampilkan banner "Install Aplikasi" jika PWA bisa diinstal.
 * Menangkap event `beforeinstallprompt` dan memberikan tombol install yang mudah diakses.
 * Banner ini hanya muncul jika browser mendukung instalasi PWA.
 */
const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pwa_install_dismissed') === 'true'
  );
  const [installing, setInstalling] = useState(false);

  // Cek apakah sudah terinstal sebagai standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch (err) {
      console.error('Install error:', err);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Jangan tampilkan jika sudah terinstal, di-dismiss, atau belum ada prompt
  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
      <div className="mx-auto max-w-lg px-3 pt-3">
        <div className="relative flex items-center gap-3 bg-gradient-to-r from-emerald-600/95 to-teal-600/95 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl shadow-emerald-900/30 border border-emerald-400/20">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">
              Install Aplikasi
            </p>
            <p className="text-emerald-100/80 text-xs leading-tight mt-0.5">
              Akses lebih cepat langsung dari layar utama
            </p>
          </div>

          {/* Install Button */}
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-shrink-0 px-4 py-2 bg-white text-emerald-700 rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-60"
          >
            {installing ? 'Menginstal...' : 'Install'}
          </button>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppBanner;
