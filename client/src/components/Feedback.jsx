import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, X, Star, MessageSquare } from 'lucide-react';
import Modal from './Modal';

const Feedback = ({ isOpen, onClose, authMethod, duration, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedbackData = {
        method: authMethod || 'undetermined',
        duration: duration || 0,
        rating,
        feedback,
        timestamp: new Date().toISOString(),
      };

      const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

      setSubmitted(true);
      toast.success('Feedback berhasil disimpan.');

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFeedback('');
        onClose();
      }, 2000);
    } catch {
      toast.error('Gagal menyimpan feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showClose={false}
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="relative">
        <button 
          className="absolute -top-1 -right-1 p-2 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-lg" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Terima Kasih!</h3>
                <p className="text-sm text-gray-500">Feedback Anda telah berhasil disimpan untuk analisis penelitian.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-semibold">Feedback Pengguna</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Berikan Pendapat Anda</h2>
                <p className="text-sm text-gray-500 mt-1">Kontribusi untuk analisis kegunaan empiris.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-400">Rating Pengalaman (1-5)</label>
                  <div className="flex gap-2.5 justify-between">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`w-12 h-12 border transition-all flex items-center justify-center rounded-xl ${
                          rating >= star ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/[0.03] border-white/[0.08] text-gray-600 hover:border-blue-500/30'
                        }`}
                        onClick={() => setRating(star)}
                      >
                        <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && <p className="text-center text-xs font-semibold text-blue-400 mt-3">Nilai: {rating}/5</p>}
                </div>

                <div>
                  <label htmlFor="feedback" className="block mb-2 text-sm font-medium text-gray-400">
                    Observasi Kualitatif (Opsional)
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Bagikan pendapat Anda tentang sistem autentikasi..."
                    rows="4"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    className="px-5 py-3.5 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all flex-1"
                    onClick={onClose}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex-1 disabled:opacity-30 shadow-lg shadow-blue-500/20"
                    disabled={rating === 0 || isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Kirim Feedback'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Feedback;
