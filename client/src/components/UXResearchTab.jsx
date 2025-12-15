import { useState } from 'react';
import { uxAPI } from '../services/api';
import { Lightbulb, Brain, Target, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const UXResearchTab = ({ uxData, loadingUX, setUxData, setLoadingUX }) => {
  const [showSUSForm, setShowSUSForm] = useState(false);
  const [susAnswers, setSusAnswers] = useState([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  const [submittingSUS, setSubmittingSUS] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('password');

  const susQuestions = [
    'Saya pikir saya akan sering menggunakan sistem ini',
    'Saya menemukan sistem ini tidak perlu kompleks',
    'Saya pikir sistem ini mudah digunakan',
    'Saya pikir saya akan memerlukan dukungan dari orang yang memiliki pengetahuan teknis untuk menggunakan sistem ini',
    'Saya menemukan berbagai fungsi dalam sistem ini terintegrasi dengan baik',
    'Saya pikir ada terlalu banyak inkonsistensi dalam sistem ini',
    'Saya akan membayangkan bahwa kebanyakan orang akan belajar menggunakan sistem ini dengan sangat cepat',
    'Saya menemukan sistem ini sangat rumit untuk digunakan',
    'Saya merasa sangat percaya diri menggunakan sistem ini',
    'Saya perlu mempelajari banyak hal sebelum dapat menggunakan sistem ini',
  ];

  const handleSUSSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSUS(true);
    try {
      await uxAPI.submitSUSSurvey({ method: selectedMethod, answers: susAnswers });
      toast.success('SUS Survey berhasil dikirim!');
      setShowSUSForm(false);
      // Reload data
      const [sus, cognitive, task] = await Promise.all([uxAPI.getSUSResults(), uxAPI.getCognitiveLoadResults(), uxAPI.getTaskCompletionResults()]);
      setUxData({
        sus: sus.data,
        cognitive: cognitive.data,
        task: task.data,
      });
    } catch (error) {
      toast.error('Gagal mengirim SUS Survey');
      console.error(error);
    } finally {
      setSubmittingSUS(false);
    }
  };

  if (loadingUX) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data UX research...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!uxData) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-center py-8">Data belum dimuat. Klik tab ini untuk memuat data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SUS Survey Results */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            SUS (System Usability Scale) Results
          </h3>
          <button onClick={() => setShowSUSForm(!showSUSForm)} className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
            {showSUSForm ? 'Tutup Form' : 'Isi Survey'}
          </button>
        </div>

        {showSUSForm && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg">
            <form onSubmit={handleSUSSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pilih Metode:</label>
                <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option value="password">Password</option>
                  <option value="webauthn">WebAuthn</option>
                </select>
              </div>
              <div className="space-y-3">
                {susQuestions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm text-gray-300 mb-2">
                      {index + 1}. {question}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            const newAnswers = [...susAnswers];
                            newAnswers[index] = value;
                            setSusAnswers(newAnswers);
                          }}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${susAnswers[index] === value ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Sangat Tidak Setuju</span>
                      <span>Sangat Setuju</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={submittingSUS} className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50">
                {submittingSUS ? 'Mengirim...' : 'Kirim Survey'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-red-400">Password</h4>
            {uxData.sus.password.count > 0 ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Score:</span>
                  <span className="text-white font-medium text-xl">{uxData.sus.password.average}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interpretation:</span>
                  <span
                    className={`font-medium ${
                      uxData.sus.password.interpretation === 'Excellent'
                        ? 'text-green-400'
                        : uxData.sus.password.interpretation === 'Good'
                        ? 'text-yellow-400'
                        : uxData.sus.password.interpretation === 'OK'
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {uxData.sus.password.interpretation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Responses:</span>
                  <span className="text-white font-medium">{uxData.sus.password.count}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data survey</p>
            )}
          </div>
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
            {uxData.sus.webauthn.count > 0 ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Score:</span>
                  <span className="text-white font-medium text-xl">{uxData.sus.webauthn.average}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interpretation:</span>
                  <span
                    className={`font-medium ${
                      uxData.sus.webauthn.interpretation === 'Excellent'
                        ? 'text-green-400'
                        : uxData.sus.webauthn.interpretation === 'Good'
                        ? 'text-yellow-400'
                        : uxData.sus.webauthn.interpretation === 'OK'
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {uxData.sus.webauthn.interpretation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Responses:</span>
                  <span className="text-white font-medium">{uxData.sus.webauthn.count}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data survey</p>
            )}
          </div>
        </div>
        {uxData.sus.comparison.winner !== 'insufficient data' && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">
              {uxData.sus.comparison.winner === 'webauthn' ? 'WebAuthn' : 'Password'} memiliki SUS score lebih tinggi ({uxData.sus.comparison.difference > 0 ? '+' : ''}
              {uxData.sus.comparison.difference} poin)
            </p>
          </div>
        )}
      </div>

      {/* Cognitive Load */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Cognitive Load Measurement
        </h3>
        {uxData.cognitive.password.count > 0 || uxData.cognitive.webauthn.count > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mental Effort:</span>
                  <span className="text-white font-medium">{uxData.cognitive.password.averageMentalEffort}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Task Difficulty:</span>
                  <span className="text-white font-medium">{uxData.cognitive.password.averageTaskDifficulty}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Pressure:</span>
                  <span className="text-white font-medium">{uxData.cognitive.password.averageTimePressure}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frustration:</span>
                  <span className="text-white font-medium">{uxData.cognitive.password.averageFrustration}/7</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Overall Load:</span>
                  <span className="text-white font-medium text-lg">{uxData.cognitive.password.averageOverall}/7</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mental Effort:</span>
                  <span className="text-white font-medium">{uxData.cognitive.webauthn.averageMentalEffort}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Task Difficulty:</span>
                  <span className="text-white font-medium">{uxData.cognitive.webauthn.averageTaskDifficulty}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Pressure:</span>
                  <span className="text-white font-medium">{uxData.cognitive.webauthn.averageTimePressure}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frustration:</span>
                  <span className="text-white font-medium">{uxData.cognitive.webauthn.averageFrustration}/7</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Overall Load:</span>
                  <span className="text-white font-medium text-lg">{uxData.cognitive.webauthn.averageOverall}/7</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada data cognitive load</p>
        )}
        {uxData.cognitive.comparison.winner !== 'insufficient data' && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">
              {uxData.cognitive.comparison.winner === 'webauthn' ? 'WebAuthn' : 'Password'} memiliki cognitive load lebih rendah ({uxData.cognitive.comparison.overallDifference < 0 ? '' : '+'}
              {uxData.cognitive.comparison.overallDifference} poin)
            </p>
          </div>
        )}
      </div>

      {/* Task Completion */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Task Completion Analysis
        </h3>
        {uxData.task.password.count > 0 || uxData.task.webauthn.count > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Time:</span>
                  <span className="text-white font-medium">{uxData.task.password.averageTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400 font-medium">{uxData.task.password.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Errors:</span>
                  <span className="text-white font-medium">{uxData.task.password.averageErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tasks Completed:</span>
                  <span className="text-white font-medium">{uxData.task.password.count}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Time:</span>
                  <span className="text-white font-medium">{uxData.task.webauthn.averageTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400 font-medium">{uxData.task.webauthn.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Errors:</span>
                  <span className="text-white font-medium">{uxData.task.webauthn.averageErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tasks Completed:</span>
                  <span className="text-white font-medium">{uxData.task.webauthn.count}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada data task completion</p>
        )}
        {uxData.task.comparison.winner !== 'insufficient data' && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">{uxData.task.comparison.winner === 'webauthn' ? 'WebAuthn' : 'Password'} lebih unggul dalam task completion</p>
            <p className="text-xs text-gray-400 mt-1">
              Time difference: {uxData.task.comparison.timeDifference}ms | Success rate difference: {uxData.task.comparison.successRateDifference}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UXResearchTab;
