import { BarChart3 } from 'lucide-react';

const CostAnalysisSection = () => (
  <div id="cost-analysis" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/[0.08] border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-semibold">
        <BarChart3 className="w-3 h-3" />
        Studi Finansial
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Analisis Biaya</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Perbandingan empiris biaya ekonomi untuk mengimplementasikan dan memelihara autentikasi Password vs WebAuthn, dihitung dari data aktual proyek.
      </p>
    </div>

    <div id="implementation" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Biaya Implementasi (Capex)</h2>
      <p className="text-gray-400 leading-relaxed">
        Dihitung berdasarkan estimasi jam pengembangan untuk setiap komponen. Data diambil dari endpoint <code className="text-blue-400">GET /api/cost/implementation</code>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-gray-400 mb-3">Password</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Backend</span><span className="text-white font-medium">8 jam</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Frontend</span><span className="text-white font-medium">4 jam</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Testing</span><span className="text-white font-medium">4 jam</span></div>
            <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2"><span className="text-gray-300 font-semibold">Total</span><span className="text-white font-bold">16 jam</span></div>
          </div>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-3">WebAuthn</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Backend</span><span className="text-white font-medium">16 jam</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Frontend</span><span className="text-white font-medium">8 jam</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Testing</span><span className="text-white font-medium">8 jam</span></div>
            <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2"><span className="text-gray-300 font-semibold">Total</span><span className="text-blue-400 font-bold">32 jam (+100%)</span></div>
          </div>
        </div>
      </div>
    </div>

    <div id="operational" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Biaya Operasional (Opex)</h2>
      <p className="text-gray-400 leading-relaxed">
        Biaya berjalan yang dihitung berdasarkan jumlah <em>support ticket</em> aktual dari data AuthLog. Endpoint: <code className="text-blue-400">GET /api/cost/operational</code>.
      </p>
      <div className="space-y-3 mt-4">
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-sm text-gray-400"><strong className="text-white">Support Tickets Password:</strong> Dihitung dari jumlah login gagal dengan error "Invalid credentials", "Account locked", dan sejenisnya. Setiap ticket diestimasikan memerlukan rata-rata 15 menit penyelesaian dengan biaya $25/jam.</p>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-sm text-gray-400"><strong className="text-white">Support Tickets WebAuthn:</strong> Dihitung dari login gagal WebAuthn (umumnya karena authenticator error teknis). Rata-rata penyelesaian 5 menit karena tidak ada issue "lupa password" — lebih rendah ~70% dibandingkan password.</p>
        </div>
      </div>
    </div>

    <div id="roi" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Return on Investment (ROI)</h2>
      <p className="text-gray-400 leading-relaxed">
        ROI dihitung berdasarkan formula: <code className="text-blue-400">ROI = ((Total Benefits - Total Investment) / Total Investment) × 100%</code>. Data dari endpoint <code className="text-blue-400">GET /api/cost/roi</code>.
      </p>
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl mt-3">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Total Investment (selisih implementasi)</span><span className="text-white">Jam × Hourly Rate ($50)</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Annual Savings (support tickets)</span><span className="text-emerald-400">Dinamis dari data</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Security Incident Prevention</span><span className="text-emerald-400">$1,000/insiden</span></div>
          <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2"><span className="text-gray-300 font-semibold">Payback Period</span><span className="text-emerald-400 font-bold">Dihitung dinamis (bulan)</span></div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-3">
        Dashboard juga menyediakan perbandingan biaya total 3 tahun melalui endpoint <code className="text-blue-400">GET /api/cost/comparison</code>, yang memperhitungkan biaya implementasi + operasional kumulatif.
      </p>
    </div>
  </div>
);

export default CostAnalysisSection;
