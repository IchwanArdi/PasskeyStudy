import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Reusable modal component that uses React Portals.
 * This ensures the modal is rendered at the body level, fixing positioning
 * issues caused by parent transforms (like animate-fade-in-up).
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidth = 'max-w-md',
  showClose = true,
  closeOnOverlayClick = true
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={() => closeOnOverlayClick && onClose()}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-[#111118] border border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-sm font-bold text-white">{title}</h3>
              ) : (
                title
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/[0.06]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
