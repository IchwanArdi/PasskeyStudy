import { Settings } from 'lucide-react';

const CompatibilitySection = () => (
  <div id="compatibility" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/[0.08] border border-teal-500/20 rounded-full text-teal-400 text-xs font-semibold">
        <Settings className="w-3 h-3" />
        Lingkungan
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Kompatibilitas Sistem</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Matriks kompatibilitas lintas perangkat dan browser terhadap WebAuthn API, beserta analisis aksesibilitas berdasarkan standar WCAG.
      </p>
    </div>

    <div id="browser" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Dukungan Browser</h2>
      <p className="text-gray-400 leading-relaxed">
        Data matriks browser diambil dari endpoint <code className="text-blue-400">GET /api/compatibility/browser-matrix</code>. Berikut kompatibilitas WebAuthn pada browser utama:
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Browser</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4 bg-white/[0.02]">WebAuthn</th>
              <th className="py-3 px-4">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Chrome</td>
              <td className="py-3 px-4 text-emerald-400">✓ v1.0+</td>
              <td className="py-3 px-4 text-emerald-400 bg-white/[0.02]">✓ v67+</td>
              <td className="py-3 px-4 text-gray-400">Dukungan penuh termasuk Passkeys</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Firefox</td>
              <td className="py-3 px-4 text-emerald-400">✓ v1.0+</td>
              <td className="py-3 px-4 text-emerald-400 bg-white/[0.02]">✓ v60+</td>
              <td className="py-3 px-4 text-gray-400">Dukungan penuh</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Safari</td>
              <td className="py-3 px-4 text-emerald-400">✓ v1.0+</td>
              <td className="py-3 px-4 text-emerald-400 bg-white/[0.02]">✓ v14+</td>
              <td className="py-3 px-4 text-gray-400">Touch ID / Face ID native</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Edge</td>
              <td className="py-3 px-4 text-emerald-400">✓ v12+</td>
              <td className="py-3 px-4 text-emerald-400 bg-white/[0.02]">✓ v18+</td>
              <td className="py-3 px-4 text-gray-400">Windows Hello terintegrasi</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">IE 11</td>
              <td className="py-3 px-4 text-emerald-400">✓</td>
              <td className="py-3 px-4 text-red-400 bg-white/[0.02]">✗</td>
              <td className="py-3 px-4 text-gray-400">Tidak didukung sama sekali</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="device" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Dukungan Perangkat & Sistem Operasi</h2>
      <p className="text-gray-400 leading-relaxed">
        Data perangkat dianalisis dari User Agent di AuthLog melalui endpoint <code className="text-blue-400">GET /api/compatibility/device-support</code>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {[
          { os: 'Windows 10+', auth: 'Windows Hello (PIN, Fingerprint, Face)', support: 'Penuh' },
          { os: 'macOS', auth: 'Touch ID', support: 'Penuh' },
          { os: 'iOS 14+', auth: 'Face ID / Touch ID', support: 'Penuh' },
          { os: 'Android 7+', auth: 'Fingerprint / Face Unlock', support: 'Penuh' },
        ].map(item => (
          <div key={item.os} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <p className="text-sm font-semibold text-white">{item.os}</p>
            <p className="text-xs text-gray-400 mt-1">{item.auth}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">Dukungan {item.support}</span>
          </div>
        ))}
      </div>
    </div>

    <div id="accessibility" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Aksesibilitas (Standar WCAG)</h2>
      <p className="text-gray-400 leading-relaxed">
        Analisis aksesibilitas berdasarkan 5 kriteria WCAG. Data dari endpoint <code className="text-blue-400">GET /api/compatibility/accessibility</code>.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01] mt-3">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Kriteria WCAG</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4 bg-white/[0.02]">WebAuthn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Navigasi Keyboard</td>
              <td className="py-3 px-4 text-gray-400">10/10 — Dukungan penuh form standar</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">7/10 — Prompt OS bergantung pada implementasi platform</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Screen Reader</td>
              <td className="py-3 px-4 text-gray-400">10/10 — Input standar</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">6/10 — Prompt biometrik mungkin tidak sepenuhnya terbaca</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Gangguan Kognitif</td>
              <td className="py-3 px-4 text-gray-400">6/10 — Harus mengingat password</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">9/10 — Tap/sentuh saja, tanpa hafalan</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Gangguan Visual</td>
              <td className="py-3 px-4 text-gray-400">7/10 — Memerlukan pengetikan</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">8/10 — Interaksi biometrik lebih intuitif</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Gangguan Motorik</td>
              <td className="py-3 px-4 text-gray-400">5/10 — Pengetikan panjang menyulitkan</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">8/10 — Satu sentuhan/tatapan cukup</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CompatibilitySection;
