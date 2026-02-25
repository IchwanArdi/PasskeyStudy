import { BarChart3 } from 'lucide-react';

const DashboardSection = () => (
  <div id="dashboard" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold">
        <BarChart3 className="w-3 h-3" />
        Analitik
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Dashboard & Metrik</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Sistem analitik komprehensif dengan empat tab yang memantau aspek keamanan, performa, usabilitas, dan ringkasan aktivitas autentikasi.
      </p>
    </div>

    <div id="overview" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Arsitektur Dashboard</h2>
      <p className="text-gray-400 leading-relaxed">
        Dashboard terdiri dari 4 tab utama. Seluruh data bersifat dinamis — diambil dari koleksi MongoDB (<code className="text-blue-400">AuthLog</code>, <code className="text-blue-400">PerformanceLog</code>, <code className="text-blue-400">SUSSurvey</code>, <code className="text-blue-400">CognitiveLoad</code>) dan diaagregasi secara real-time oleh backend.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {[
          { tab: 'Ringkasan', desc: 'Total sesi, rasio WebAuthn, skor risiko, node aktif, grafik aktivitas, distribusi error, dan tingkat keberhasilan.', api: '/api/stats/global-stats' },
          { tab: 'Analisis Keamanan', desc: 'Benchmark ketahanan, ketahanan phishing, imunitas brute force, simulasi vektor serangan, dan verifikasi origin binding.', api: '/api/security/*' },
          { tab: 'Riset UX', desc: 'System Usability Scale (SUS), distribusi beban kognitif (NASA-TLX), dan efisiensi eksekusi tugas.', api: '/api/ux/*' },
          { tab: 'Performa', desc: 'Latensi (Avg, P50, P95), perbandingan payload size, round-trips, dan analisis kuantitatif.', api: '/api/performance/*' },
        ].map(item => (
          <div key={item.tab} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <h4 className="font-bold text-white mb-1">{item.tab}</h4>
            <p className="text-sm text-gray-400 mb-2">{item.desc}</p>
            <code className="text-xs text-blue-400">{item.api}</code>
          </div>
        ))}
      </div>
    </div>

    <div id="metrics" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Metrik Perbandingan</h2>
      <p className="text-gray-400 leading-relaxed">
        Modul perbandingan membandingkan data WebAuthn real-time terhadap statistik password baseline. Setiap metrik dilengkapi tombol info (ℹ️) yang menampilkan penjelasan akademis detail tentang cara perhitungan dan relevansinya dalam konteks WebAuthn/FIDO2.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Aspek</th>
              <th className="py-3 px-4">Metrik yang Diukur</th>
              <th className="py-3 px-4 bg-white/[0.02]">Sumber Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Keamanan</td>
              <td className="py-3 px-4 text-gray-400">Phishing Resistance (%), Brute Force Immunity (%), Security Score (0-100)</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">AuthLog + Simulasi</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Performa</td>
              <td className="py-3 px-4 text-gray-400">Avg Response Time (ms), P50/P95 Latency, Payload Size (bytes), Round-Trips</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">PerformanceLog</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Usabilitas</td>
              <td className="py-3 px-4 text-gray-400">SUS Score (0-100), Cognitive Load (1-7), Task Completion Time (ms), Success Rate (%)</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">SUSSurvey + CognitiveLoad + TaskCompletion</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Biaya</td>
              <td className="py-3 px-4 text-gray-400">Implementation Cost (jam), Operational Cost ($), ROI (%), Payback Period (bulan)</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">AuthLog + Estimasi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default DashboardSection;
