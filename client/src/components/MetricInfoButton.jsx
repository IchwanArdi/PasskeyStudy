import { useState } from 'react';
import { Info, X } from 'lucide-react';

/**
 * Reusable component: ikon info kecil yang membuka modal penjelasan metrik.
 * Digunakan di semua tab Dashboard untuk edukasi konteks WebAuthn/FIDO2.
 *
 * @param {string} title - Judul metrik
 * @param {string} description - Penjelasan detail metrik
 * @param {string} [relevance] - Relevansi metrik dalam konteks skripsi WebAuthn
 * @param {string} [className] - className tambahan untuk positioning
 */
const MetricInfoButton = ({ title, description, relevance, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all ${className}`}
        title={`Info: ${title}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[#111118] border border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Penjelasan</p>
                <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
              </div>

              {relevance && (
                <div className="p-4 bg-blue-500/[0.05] border border-blue-500/15 rounded-xl">
                  <p className="text-xs font-semibold text-blue-400 mb-1.5">Relevansi WebAuthn / FIDO2</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{relevance}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded-xl text-sm font-medium transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetricInfoButton;
