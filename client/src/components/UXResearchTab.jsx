import { useState } from 'react';
import { uxAPI } from '../services/api';
import { Lightbulb, Brain, Target, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

const UXResearchTab = ({ uxData, loadingUX, setUxData }) => {
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
      toast.success('Data survei berhasil disimpan');
      setShowSUSForm(false);
      const data = await uxAPI.getUXData();
      setUxData(data);
    } catch (error) {
      toast.error('Gagal menyimpan data survei');
      console.error(error);
    } finally {
      setSubmittingSUS(false);
    }
  };

  if (loadingUX) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Memuat data riset UX...</p>
        </div>
      </div>
    );
  }

  if (!uxData) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <p className="text-sm font-medium text-gray-600 text-center">Data UX belum tersedia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* SUS Benchmark */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold">System Usability Scale (SUS)</h3>
          </div>
          <button
            onClick={() => setShowSUSForm(!showSUSForm)}
            className="px-4 py-2.5 bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-500/15 transition-all flex items-center gap-2"
          >
            {showSUSForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showSUSForm ? 'Tutup Form' : 'Isi Survei Manual'}
          </button>
        </div>

        {showSUSForm && (
          <div className="mb-10 p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-fade-in-up">
            <form onSubmit={handleSUSSubmit} className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <span className="text-sm font-medium text-gray-400">Metode Autentikasi</span>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.08] text-white px-4 py-2.5 text-sm font-medium rounded-xl outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="password">Password (Legacy)</option>
                  <option value="webauthn">WebAuthn (Biometrik)</option>
                </select>
              </div>

              <div className="space-y-8">
                {susQuestions.map((question, index) => (
                  <div key={index} className="space-y-3">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      <span className="text-blue-400 font-bold mr-2">{index + 1}.</span> {question}
                    </p>
                    <div className="flex gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            const newAnswers = [...susAnswers];
                            newAnswers[index] = value;
                            setSusAnswers(newAnswers);
                          }}
                          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${susAnswers[index] === value ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.04]'}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submittingSUS}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {submittingSUS ? 'Menyimpan...' : 'Simpan Data Survei'}
              </button>
            </form>
          </div>
        )}

        {/* Results Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {['password', 'webauthn'].map((method) => {
            const data = uxData.sus[method];
            return (
              <div key={method} className="space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-semibold ${method === 'webauthn' ? 'text-blue-400' : 'text-gray-500'}`}>
                    {method === 'webauthn' ? 'WebAuthn' : 'Password (Legacy)'}
                  </h4>
                  <span className="text-xs font-medium text-gray-600">{data.count} observasi</span>
                </div>

                {data.count > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold">{data.average}</span>
                      <span className="text-sm font-medium text-gray-500">Rating: {data.interpretation}</span>
                    </div>
                    <div className="pt-4 border-t border-white/[0.06]">
                      <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                        <span>Performa Benchmark</span>
                        <span className="text-gray-400">Stabil</span>
                      </div>
                      <div className="w-full bg-white/[0.04] rounded-full h-2">
                        <div className={`h-full rounded-full ${method === 'webauthn' ? 'bg-blue-500' : 'bg-gray-600'}`} style={{ width: `${data.average}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-sm font-medium text-gray-600">
                    Belum ada data empiris
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cognitive Load */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold">Distribusi Beban Kognitif</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {['password', 'webauthn'].map((method) => {
            const data = uxData.cognitive[method];
            return (
              <div key={method} className="space-y-5">
                <h4 className={`text-sm font-semibold ${method === 'webauthn' ? 'text-purple-400' : 'text-gray-500'}`}>
                  {method === 'webauthn' ? 'WebAuthn' : 'Password'}
                </h4>

                {data.count > 0 ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Usaha Mental', val: data.averageMentalEffort },
                      { label: 'Kesulitan Tugas', val: data.averageTaskDifficulty },
                      { label: 'Tekanan Waktu', val: data.averageTimePressure },
                      { label: 'Frustrasi', val: data.averageFrustration },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-500">
                          <span>{metric.label}</span>
                          <span className="text-white font-mono">{metric.val}/7</span>
                        </div>
                        <div className="w-full bg-white/[0.04] rounded-full h-2">
                          <div className={`h-full rounded-full ${method === 'webauthn' ? 'bg-purple-500' : 'bg-gray-600'}`} style={{ width: `${(metric.val / 7) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-5 border-t border-white/[0.06] flex justify-between items-baseline">
                      <span className="text-sm font-medium text-gray-500">Impedansi Kognitif Kumulatif</span>
                      <span className="text-2xl font-bold font-mono">{data.averageOverall}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-sm font-medium text-gray-600">
                    Data belum tersedia
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Execution */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold">Efisiensi Eksekusi Tugas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {['password', 'webauthn'].map((method) => {
            const data = uxData.task[method];
            return (
              <div key={method} className="space-y-5">
                <h4 className={`text-sm font-semibold ${method === 'webauthn' ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {method === 'webauthn' ? 'WebAuthn' : 'Password'}
                </h4>

                {data.count > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <p className="text-xs font-medium text-gray-500 mb-2">Latensi Rata-rata</p>
                      <p className="text-xl font-bold font-mono">{data.averageTime}ms</p>
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <p className="text-xs font-medium text-gray-500 mb-2">Tingkat Keberhasilan</p>
                      <p className="text-xl font-bold font-mono text-emerald-400">{data.successRate}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-sm font-medium text-gray-600">
                    Menunggu partisipan penelitian
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UXResearchTab;
