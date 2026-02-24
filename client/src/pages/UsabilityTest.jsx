import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uxAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Shield, Users, ClipboardCheck, Timer, BarChart, Download, ArrowRight, Play, Square, CheckCircle, Info } from 'lucide-react';

const UsabilityTest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Demografis, 2: Task Scenarios, 3: Surveys, 4: Done
  const [loading, setLoading] = useState(false);
  
  // Demographics state
  const [demographics, setDemographics] = useState({
    age: '',
    gender: 'Male',
    techExpertise: 5,
    biometricExperience: false,
    occupation: ''
  });

  // Task state
  const [activeTask, setActiveTask] = useState(null);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Survey state (SUS)
  const [susAnswers, setSusAnswers] = useState(Array(10).fill(3));
  
  // Cognitive Load state
  const [cogLoad, setCogLoad] = useState({
    mentalEffort: 4,
    taskDifficulty: 4,
    timePressure: 4,
    frustration: 4
  });

  const taskScenarios = [
    { id: 'register', label: 'Registrasi Akun Baru', description: 'Daftarkan akun baru menggunakan metode yang ditentukan.' },
    { id: 'login', label: 'Login Akun', description: 'Masuk ke akun yang baru saja dibuat.' },
    { id: 'recovery', label: 'Pemulihan Akun', description: 'Simulasikan kehilangan perangkat dan gunakan kode pemulihan.' }
  ];

  const handleStartTask = (taskId) => {
    setActiveTask(taskId);
    setTaskStartTime(Date.now());
    toast.info(`Tugas dimulai: ${taskScenarios.find(t => t.id === taskId).label}`);
  };

  const handleCompleteTask = async (success = true) => {
    const duration = Date.now() - taskStartTime;
    const newTask = {
      taskType: activeTask,
      method: 'webauthn', // In this passwordless-only version
      duration,
      success,
      timestamp: new Date()
    };

    setCompletedTasks([...completedTasks, newTask]);
    
    try {
      await uxAPI.submitTaskCompletion({
        method: 'webauthn',
        taskType: activeTask,
        completionTime: duration,
        success
      });
    } catch {
      console.error('Failed to log task completion');
    }

    setActiveTask(null);
    setTaskStartTime(null);
    toast.success('Tugas selesai dan dicatat');
  };

  const handleSubmitDemographics = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await uxAPI.submitDemographics(demographics);
      toast.success('Data demografis disimpan');
      setStep(2);
    } catch {
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSurveys = async () => {
    setLoading(true);
    try {
      await Promise.all([
        uxAPI.submitSUSSurvey({ method: 'webauthn', answers: susAnswers }),
        uxAPI.submitCognitiveLoad({ method: 'webauthn', ...cogLoad })
      ]);
      toast.success('Hasil survei berhasil dikirim');
      setStep(4);
    } catch {
      toast.error('Gagal mengirim survei');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await uxAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'research-data.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Data berhasil diekspor');
    } catch {
      toast.error('Ekspor gagal');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30 font-sans pb-20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-sm font-bold tracking-tight">Usability Testing Framework</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm transition-colors">
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto pt-32 px-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12">
          {['Demografis', 'Skenario Tugas', 'Survei SUS/Load', 'Selesai'].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${step > i + 1 ? 'bg-emerald-500 border-emerald-500 text-white' : step === i + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/[0.03] border-white/[0.1] text-gray-600'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${step === i + 1 ? 'text-blue-400' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Demographics */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Data Demografis Responden</h2>
              <p className="text-gray-500">Informasi ini diperlukan untuk analisis profil pengguna dalam skripsi.</p>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <form onSubmit={handleSubmitDemographics} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Usia</label>
                    <input
                      type="number"
                      required
                      value={demographics.age}
                      onChange={e => setDemographics({...demographics, age: e.target.value})}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Jenis Kelamin</label>
                    <select
                      value={demographics.gender}
                      onChange={e => setDemographics({...demographics, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:border-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Keahlian Teknologi (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={demographics.techExpertise}
                    onChange={e => setDemographics({...demographics, techExpertise: parseInt(e.target.value)})}
                    className="w-full h-2 bg-blue-500/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-bold uppercase">
                    <span>Awam</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <input
                    type="checkbox"
                    id="biometric"
                    checked={demographics.biometricExperience}
                    onChange={e => setDemographics({...demographics, biometricExperience: e.target.checked})}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/20"
                  />
                  <label htmlFor="biometric" className="text-sm text-gray-300 pointer-events-none">
                    Pernah menggunakan autentikasi biometrik sebelumnya (FaceID/Fingerprint)?
                  </label>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                  {loading ? 'Menyimpan...' : 'Lanjutkan ke Skenario Tugas'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2: Task Scenarios */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Skenario Tugas (Task Scenarios)</h2>
              <p className="text-gray-500">Silakan jalankan setiap tugas di bawah ini. Waktu penyelesaian akan diukur secara otomatis.</p>
            </div>

            <div className="space-y-4">
              {taskScenarios.map((task) => {
                const isCompleted = completedTasks.some(t => t.taskType === task.id);
                const isActive = activeTask === task.id;
                
                return (
                  <div key={task.id} className={`glass-card rounded-2xl p-6 border-l-4 transition-all ${isCompleted ? 'border-l-emerald-500 opacity-60' : isActive ? 'border-l-blue-500 bg-blue-500/[0.03]' : 'border-l-transparent'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                          {task.label}
                          {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                      
                      {!isCompleted && !activeTask && (
                        <button onClick={() => handleStartTask(task.id)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-white/10">
                          <Play className="w-3.5 h-3.5" /> Mulai
                        </button>
                      )}
                      
                      {isActive && (
                        <button onClick={() => handleCompleteTask()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                          <Square className="w-3.5 h-3.5 fill-current" /> Selesai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Progres: {completedTasks.length} dari {taskScenarios.length} tugas selesai</span>
              </div>
              <button
                disabled={completedTasks.length < 3}
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                Lanjut ke Kuesioner
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Surveys */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Evaluasi Usabilitas</h2>
              <p className="text-gray-500">Mohon isi kuesioner SUS dan Cognitive Load di bawah ini berdasarkan pengalaman Anda.</p>
            </div>

            <div className="space-y-8">
              {/* Cognitive Load Section */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400">
                  <BarChart className="w-5 h-5" /> Cognitive Load Assessment
                </h3>
                <div className="space-y-8">
                  <COGSlider label="Mental Effort" detail="Seberapa banyak aktivitas mental yang dibutuhkan?" value={cogLoad.mentalEffort} onChange={v => setCogLoad({...cogLoad, mentalEffort: v})} />
                  <COGSlider style="amber" label="Task Difficulty" detail="Seberapa sulit tugas yang dijalankan tadi?" value={cogLoad.taskDifficulty} onChange={v => setCogLoad({...cogLoad, taskDifficulty: v})} />
                  <COGSlider style="purple" label="Time Pressure" detail="Seberapa terburu-buru yang Anda rasakan?" value={cogLoad.timePressure} onChange={v => setCogLoad({...cogLoad, timePressure: v})} />
                  <COGSlider style="red" label="Frustration" detail="Seberapa tidak nyaman/frustrasi Anda?" value={cogLoad.frustration} onChange={v => setCogLoad({...cogLoad, frustration: v})} />
                </div>
              </div>

              {/* SUS Section */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                  <ClipboardCheck className="w-5 h-5" /> System Usability Scale (SUS)
                </h3>
                <div className="space-y-6">
                  {SUS_QUESTIONS.map((q, i) => (
                    <div key={i} className="pb-6 border-b border-white/[0.04] last:border-0 last:pb-0">
                      <p className="text-sm text-gray-300 mb-4">{i+1}. {q}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-gray-600 font-bold uppercase w-20">Sangat Tidak Setuju</span>
                        <div className="flex gap-1 flex-1 justify-center">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button
                              key={val}
                              onClick={() => {
                                const newAns = [...susAnswers];
                                newAns[i] = val;
                                setSusAnswers(newAns);
                              }}
                              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border ${susAnswers[i] === val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/[0.03] border-white/[0.08] text-gray-600 hover:border-white/20'}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase w-20 text-right">Sangat Setuju</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmitSurveys} disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                {loading ? 'Mengirim Data...' : 'Selesaikan Pengujian & Simpan'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="animate-fade-in-up flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/15 rounded-full flex items-center justify-center mb-8">
              <Users className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Pengujian Selesai!</h2>
            <p className="text-gray-500 max-w-sm mb-12">Terima kasih telah berpartisipasi dalam pengujian usabilitas sistem autentikasi passwordless ini. Data Anda sangat berharga bagi skripsi saya.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button onClick={handleExportData} className="py-4 glass-card hover:bg-white/[0.05] rounded-xl font-bold flex items-center justify-center gap-3 transition-all">
                <Download className="w-5 h-5 text-blue-400" /> Ekspor Hasil Riset (CSV)
              </button>
              <button onClick={() => navigate('/dashboard')} className="py-4 bg-white/10 hover:bg-white/15 rounded-xl font-bold transition-all">
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Instructions for Step 2 */}
      {step === 2 && activeTask && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-bounce-subtle">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Sedang Diukur</p>
                <p className="font-bold">{taskScenarios.find(t => t.id === activeTask).label}</p>
              </div>
            </div>
            <button onClick={() => handleCompleteTask()} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm">Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
};

const COGSlider = ({ label, detail, value, onChange, style = 'blue' }) => {
  const colors = {
    blue: 'accent-blue-600 bg-blue-500/10 text-blue-400',
    amber: 'accent-amber-600 bg-amber-500/10 text-amber-400',
    purple: 'accent-purple-600 bg-purple-500/10 text-purple-400',
    red: 'accent-red-600 bg-red-500/10 text-red-400'
  };
  
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-200">{label}</h4>
          <p className="text-xs text-gray-600">{detail}</p>
        </div>
        <span className={`text-2xl font-black ${colors[style].split(' ')[2]}`}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="7"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colors[style].split(' ')[0]} ${colors[style].split(' ')[1]}`}
      />
      <div className="flex justify-between text-[8px] text-gray-700 mt-2 font-black uppercase tracking-tighter">
        <span>Sangat Rendah (1)</span>
        <span>Netral (4)</span>
        <span>Sangat Tinggi (7)</span>
      </div>
    </div>
  );
};

const SUS_QUESTIONS = [
  "Saya rasa saya ingin sering menggunakan sistem ini.",
  "Saya rasa sistem ini terlalu rumit padahal bisa dibuat lebih sederhana.",
  "Saya rasa sistem ini mudah digunakan.",
  "Saya rasa saya butuh bantuan orang teknis untuk bisa menggunakan sistem ini.",
  "Saya rasa berbagai fungsi dalam sistem ini terintegrasi dengan baik.",
  "Saya rasa sistem ini terlalu banyak yang tidak konsisten.",
  "Saya rasa orang lain akan belajar menggunakan sistem ini dengan sangat cepat.",
  "Saya rasa sistem ini sangat membingungkan saat digunakan.",
  "Saya rasa saya merasa sangat percaya diri saat menggunakan sistem ini.",
  "Saya rasa saya perlu belajar banyak hal sebelum saya bisa menggunakan sistem ini."
];

export default UsabilityTest;
