import { Shield } from 'lucide-react';

const LimitationsSection = () => (
  <div id="limitations" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
        <Shield className="w-3 h-3" />
        Evaluasi Kritis
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Kelemahan & Limitasi</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Analisis objektif terhadap keterbatasan teknologi WebAuthn/FIDO2. Bagian ini disusun untuk menjaga integritas akademis dengan menyajikan sisi kekurangan secara jujur.
      </p>
    </div>

    <div id="hardware-dep" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Ketergantungan pada Hardware & Platform</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Ketersediaan Authenticator</h4>
          <p className="text-sm text-gray-400">WebAuthn memerlukan authenticator yang kompatibel — baik platform authenticator (fingerprint reader, Windows Hello, Face ID) maupun roaming authenticator (YubiKey, Titan Key). Perangkat lama tanpa TPM atau biometrik tidak dapat menggunakan WebAuthn sebagai faktor utama. Ini menciptakan hambatan adopsi yang signifikan, terutama di lingkungan dengan perangkat heterogen.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Variasi Implementasi Platform</h4>
          <p className="text-sm text-gray-400">Meskipun WebAuthn adalah standar W3C, implementasi di setiap platform berbeda. Contoh: perilaku UI prompt biometrik berbeda antara Chrome di Windows (Windows Hello), Chrome di macOS (Touch ID), dan Firefox. Hal ini mempersulit pengujian dan dapat membingungkan pengguna yang menggunakan beberapa perangkat.</p>
        </div>
      </div>
    </div>

    <div id="recovery-challenge" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Kompleksitas Pemulihan Akun</h2>
      <p className="text-gray-400 leading-relaxed">
        Salah satu tantangan terbesar sistem passwordless adalah <strong className="text-white">account recovery</strong>. Ketika perangkat hilang, rusak, atau dicuri, pengguna kehilangan akses ke private key. Berbeda dengan password yang bisa di-reset melalui email, credential WebAuthn terikat ke hardware spesifik.
      </p>
      <div className="p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mt-3">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-amber-400">Solusi dalam Proyek Ini:</strong> Implementasi offline recovery codes (SHA-256 hashed) dan dukungan multi-device (menambah perangkat cadangan). Namun, ini menambah kompleksitas UX dan memerlukan edukasi pengguna tentang pentingnya menyimpan recovery codes.
        </p>
      </div>
    </div>

    <div id="adoption-barriers" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Hambatan Adopsi</h2>
      <div className="space-y-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Kurva Pembelajaran Pengembang</h4>
          <p className="text-sm text-gray-400">Implementasi WebAuthn memerlukan pemahaman konsep kriptografi asimetris, CBOR encoding, attestation vs assertion, dan keamanan browser API. Ini secara signifikan lebih kompleks dibandingkan implementasi password tradisional (hash + compare).</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Persepsi Pengguna Akhir</h4>
          <p className="text-sm text-gray-400">Banyak pengguna belum terbiasa dengan konsep passwordless. Prompt biometrik yang muncul tiba-tiba bisa menimbulkan kebingungan atau kekhawatiran privasi. Edukasi pengguna diperlukan untuk meningkatkan tingkat adopsi dan kepercayaan.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Kompatibilitas Browser</h4>
          <p className="text-sm text-gray-400">Meskipun semua browser modern mendukung WebAuthn (Chrome 67+, Firefox 60+, Safari 14+, Edge 18+), browser lama seperti Internet Explorer tidak mendukung sama sekali. Hal ini membatasi penggunaan di lingkungan enterprise yang masih menggunakan browser legacy.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-amber-400 mb-2">Biaya Awal</h4>
          <p className="text-sm text-gray-400">Berdasarkan analisis biaya dalam proyek ini, implementasi WebAuthn memerlukan sekitar 32 jam pengembangan vs 16 jam untuk password — peningkatan 100%. Namun, biaya operasional jangka panjang secara signifikan lebih rendah karena eliminasi support ticket "lupa password".</p>
        </div>
      </div>
    </div>

    <div id="technical-limits" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Keterbatasan Teknis</h2>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Limitasi</th>
              <th className="py-3 px-4">Dampak</th>
              <th className="py-3 px-4 bg-white/[0.02]">Workaround</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Cross-origin sharing</td>
              <td className="py-3 px-4 text-gray-400">Credential tidak bisa dibagikan antar domain</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Related Origin Requests (proposal W3C)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Offline authentication</td>
              <td className="py-3 px-4 text-gray-400">Memerlukan koneksi ke server untuk challenge</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Cached tokens / offline-capable flows</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Shared devices</td>
              <td className="py-3 px-4 text-gray-400">Biometrik terikat ke satu orang per perangkat</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Multi-user profile OS level</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Server-side complexity</td>
              <td className="py-3 px-4 text-gray-400">Verifikasi attestation lebih kompleks</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Library abstraction (@simplewebauthn)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default LimitationsSection;
