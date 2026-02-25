import { BarChart3 } from 'lucide-react';

const MethodologySection = () => (
  <div id="methodology" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold">
        <BarChart3 className="w-3 h-3" />
        Metodologi
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Metodologi Analisis</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Dokumentasi teknis tentang bagaimana setiap metrik dalam dashboard dihitung dari data mentah di MongoDB. Penting untuk transparansi dan reprodusibilitas hasil penelitian.
      </p>
    </div>

    <div id="security-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Perhitungan Skor Keamanan</h2>
      <p className="text-gray-400 leading-relaxed">
        Skor keamanan bersifat dinamis — dihitung dari data autentikasi aktual di <code className="text-blue-400">AuthLog</code>, bukan nilai statis.
      </p>
      <div className="space-y-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Ketahanan Phishing</h4>
          <p className="text-sm text-gray-400 mb-2">Dihitung melalui endpoint <code className="text-gray-300">GET /api/security/phishing-resistance</code>:</p>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300">
            <p className="text-gray-500">// Skor dasar WebAuthn: 10 (max), Password: 5 (max)</p>
            <p className="text-gray-500">// Disesuaikan berdasarkan rasio keberhasilan/kegagalan aktual</p>
            <p>dynamicScore = calculateDynamicScore(logs, baseScore)</p>
            <p>finalScore = dynamicScore * 10  <span className="text-gray-500">// konversi ke skala 0-100</span></p>
          </div>
          <p className="text-xs text-gray-500 mt-2">WebAuthn mendapat skor tinggi karena domain binding algorithm. Password dihitung dengan formula asimtotik yang menurunkan skor ketika rasio kegagalan meningkat.</p>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Simulasi Brute Force</h4>
          <p className="text-sm text-gray-400 mb-2">Melalui endpoint <code className="text-gray-300">POST /api/security/brute-force-simulation</code>:</p>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300">
            <p className="text-gray-500">// Password: Eksekusi bcrypt.compare() terhadap common passwords</p>
            <p>avgTimePerAttempt = totalDuration / attempts</p>
            <p>estimatedTime = avgTime × 95^8  <span className="text-gray-500">// 8 char, 95 possible chars</span></p>
            <br/>
            <p className="text-gray-500">// WebAuthn: Kalkulasi teoretis (key space 2^256)</p>
            <p>keySpace = 2^256 ≈ 1.16 × 10^77 kemungkinan</p>
            <p>resistance = "Immune"  <span className="text-gray-500">// secara komputasional mustahil</span></p>
          </div>
        </div>
      </div>
    </div>

    <div id="performance-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Metrik Performa (Latensi & Payload)</h2>
      <p className="text-gray-400 leading-relaxed">
        Setiap request autentikasi dicatat oleh middleware backend ke koleksi <code className="text-blue-400">PerformanceLog</code>.
      </p>
      <div className="space-y-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-emerald-400 mb-2">Latensi</h4>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300">
            <p className="text-gray-500">// Diukur di Express middleware</p>
            <p>responseTime = Date.now() - requestStartTime  <span className="text-gray-500">(ms)</span></p>
            <br/>
            <p className="text-gray-500">// Persentil dihitung dari array terurut</p>
            <p>P50 = sorted[Math.floor(n × 0.5)]</p>
            <p>P95 = sorted[Math.floor(n × 0.95)]</p>
            <p>P99 = sorted[Math.floor(n × 0.99)]</p>
          </div>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-emerald-400 mb-2">Payload Size</h4>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300">
            <p className="text-gray-500">// Ukuran request body dan response body</p>
            <p>requestSize = JSON.stringify(req.body).length  <span className="text-gray-500">(bytes)</span></p>
            <p>responseSize = JSON.stringify(responseData).length  <span className="text-gray-500">(bytes)</span></p>
          </div>
          <p className="text-xs text-gray-500 mt-2">WebAuthn payload umumnya lebih besar karena mengandung attestation object (CBOR-encoded), public key, dan signature digital.</p>
        </div>
      </div>
    </div>

    <div id="ux-math" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Kalkulasi System Usability Scale (SUS)</h2>
      <p className="text-gray-400 leading-relaxed">
        SUS menggunakan rumus standar akademis yang dikembangkan oleh John Brooke (1986). Implementasi dalam proyek ini ada di endpoint <code className="text-blue-400">POST /api/ux/sus-survey</code>:
      </p>
      <div className="p-4 bg-black/50 border border-white/10 rounded-lg font-mono text-sm text-gray-300 mt-3">
        <p className="text-gray-500">// 10 pertanyaan, skala Likert 1-5</p>
        <p className="text-gray-500">// Item ganjil (1,3,5,7,9) = positif</p>
        <p className="text-gray-500">// Item genap (2,4,6,8,10) = negatif</p>
        <br/>
        <p>skorGanjil = (nilaiPengguna - 1)  <span className="text-gray-500">// untuk setiap item ganjil</span></p>
        <p>skorGenap = (5 - nilaiPengguna)   <span className="text-gray-500">// untuk setiap item genap</span></p>
        <p>skorSUS = (totalGanjil + totalGenap) × 2.5</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01] mt-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Skor SUS</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4 bg-white/[0.02]">Interpretasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr><td className="py-2 px-4 text-emerald-400 bg-white/[0.02] font-medium">&gt; 80.3</td><td className="py-2 px-4 text-white">A</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">Excellent</td></tr>
            <tr><td className="py-2 px-4 text-blue-400 bg-white/[0.02] font-medium">68 — 80.3</td><td className="py-2 px-4 text-white">B</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">Good</td></tr>
            <tr><td className="py-2 px-4 text-yellow-400 bg-white/[0.02] font-medium">51 — 68</td><td className="py-2 px-4 text-white">C</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">OK</td></tr>
            <tr><td className="py-2 px-4 text-orange-400 bg-white/[0.02] font-medium">25.1 — 51</td><td className="py-2 px-4 text-white">D</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">Poor</td></tr>
            <tr><td className="py-2 px-4 text-red-400 bg-white/[0.02] font-medium">&lt; 25.1</td><td className="py-2 px-4 text-white">F</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">Worst Imaginable</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MethodologySection;
