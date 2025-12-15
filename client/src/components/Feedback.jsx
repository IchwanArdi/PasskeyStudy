import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, X, Star } from 'lucide-react';

const Feedback = ({ onClose, authMethod, duration }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simpan feedback ke localStorage (bisa diubah ke API jika diperlukan)
    const feedbackData = {
      method: authMethod,
      duration,
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    };

    const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

    setSubmitted(true);
    toast.success('Terima kasih atas feedback Anda!');

    setTimeout(() => {
      if (onClose) onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Terima Kasih!</h3>
          <p className="text-gray-400">Feedback Anda telah direkam dan akan membantu penelitian ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 max-w-md w-full relative">
        <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Bagaimana Pengalaman Anda?</h2>
          <p className="text-gray-400">Bantu kami dengan memberikan feedback tentang pengalaman login Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Metode Autentikasi:</span>
              <span className="text-white font-semibold">{authMethod === 'password' ? 'Password' : 'WebAuthn'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Durasi Login:</span>
              <span className="text-white font-semibold">{duration}ms</span>
            </div>
          </div>

          <div>
            <label className="block mb-3 text-sm font-medium text-white">Rating Pengalaman (1-5)</label>
            <div className="flex gap-2 justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    rating >= star ? 'bg-yellow-400 border-yellow-400 text-gray-900' : 'bg-transparent border-gray-700 text-gray-400 hover:border-yellow-400/50'
                  }`}
                  onClick={() => setRating(star)}
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-yellow-400 font-semibold text-sm mt-2">
                {rating === 1 && 'Sangat Buruk'}
                {rating === 2 && 'Buruk'}
                {rating === 3 && 'Biasa'}
                {rating === 4 && 'Baik'}
                {rating === 5 && 'Sangat Baik'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="feedback" className="block mb-2 text-sm font-medium text-white">
              Komentar (Opsional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Bagikan pengalaman Anda, saran, atau komentar..."
              rows="4"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all flex-1" onClick={onClose}>
              Lewati
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={rating === 0}
            >
              Kirim Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
