import { useState } from 'react';
import { Info, X } from 'lucide-react';
import Modal from './Modal';

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
        className={`flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all ${className}`}
        title={`Info: ${title}`}
      >
        <Info className="w-3.5 h-3.5 text-blue-400" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="max-w-lg"
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Info className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
        }
        footer={
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded-xl text-sm font-medium transition-all"
          >
            Tutup
          </button>
        }
      >
        <div className="space-y-4">
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
      </Modal>
    </>
  );
};

export default MetricInfoButton;
