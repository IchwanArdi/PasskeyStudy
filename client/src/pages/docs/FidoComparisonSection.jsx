import { Shield } from 'lucide-react';

const FidoComparisonSection = () => (
  <div id="fido-comparison" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/[0.08] border border-violet-500/20 rounded-full text-violet-400 text-xs font-semibold">
        <Shield className="w-3 h-3" />
        Standar & Protokol
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Perbandingan Standar FIDO</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Evolusi standar autentikasi dari FIDO Alliance: dari FIDO UAF dan U2F hingga FIDO2 dan WebAuthn. Pemahaman konteks historis ini penting untuk memposisikan proyek dalam lanskap teknologi autentikasi.
      </p>
    </div>

    <div id="evolution" className="space-y-6 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Evolusi Standar FIDO Alliance</h2>
      <p className="text-gray-400 leading-relaxed">
        FIDO Alliance (Fast IDentity Online) didirikan pada tahun 2012 oleh PayPal, Lenovo, Nok Nok Labs, Validity Sensors, Infineon, dan Agnitio. Tujuannya adalah menciptakan standar autentikasi terbuka yang mengurangi ketergantungan pada password. Berikut evolusi standarnya:
      </p>

      <div className="space-y-4 mt-4">
        {[
          { year: '2014', name: 'FIDO UAF 1.0', color: 'text-gray-400', desc: 'Universal Authentication Framework — autentikasi passwordless pertama, namun membutuhkan integrasi SDK khusus per platform.' },
          { year: '2014', name: 'FIDO U2F 1.0', color: 'text-gray-400', desc: 'Universal 2nd Factor — menambahkan faktor kedua (security key) ke password yang sudah ada. Didukung Google Chrome.' },
          { year: '2018', name: 'WebAuthn Level 1', color: 'text-blue-400', desc: 'Standar W3C untuk Web Authentication. Mengintegrasikan FIDO ke browser API native tanpa plugin tambahan.' },
          { year: '2019', name: 'FIDO2 (CTAP2)', color: 'text-emerald-400', desc: 'Client to Authenticator Protocol v2 — protokol komunikasi antara platform dan roaming authenticator.' },
          { year: '2021', name: 'WebAuthn Level 2', color: 'text-violet-400', desc: 'Pembaruan W3C dengan dukungan lebih baik untuk attestation, large blob storage, dan credential management.' },
          { year: '2022', name: 'Passkeys', color: 'text-amber-400', desc: 'Multi-device credentials — credential yang dapat disinkronisasi antar perangkat melalui cloud (iCloud Keychain, Google Password Manager).' },
        ].map(item => (
          <div key={item.name} className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <div className="w-14 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{item.year}</div>
            <div>
              <p className={`text-sm font-semibold ${item.color}`}>{item.name}</p>
              <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div id="comparison-table" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Tabel Perbandingan</h2>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <div className="min-w-[700px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4 bg-white/[0.02]">Aspek</th>
                <th className="py-3 px-4">FIDO UAF</th>
                <th className="py-3 px-4 bg-white/[0.02]">FIDO U2F</th>
                <th className="py-3 px-4">FIDO2 / WebAuthn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Tujuan Utama</td>
                <td className="py-3 px-4 text-gray-400">Passwordless</td>
                <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Second Factor (2FA)</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">Passwordless + 2FA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Platform Support</td>
                <td className="py-3 px-4 text-gray-400">Mobile SDK</td>
                <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Browser (Chrome, Firefox)</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">Semua browser & OS modern</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Authenticator</td>
                <td className="py-3 px-4 text-gray-400">Platform (built-in)</td>
                <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Roaming (USB key)</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">Platform + Roaming</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Integrasi Web</td>
                <td className="py-3 px-4 text-gray-400">Memerlukan SDK/Plugin</td>
                <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">JavaScript API sederhana</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">Native Browser API (navigator.credentials)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Standarisasi</td>
                <td className="py-3 px-4 text-gray-400">FIDO Alliance</td>
                <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">FIDO Alliance</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">W3C + FIDO Alliance</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Multi-Device Sync</td>
                <td className="py-3 px-4 text-red-400">✗</td>
                <td className="py-3 px-4 text-red-400 bg-white/[0.02]">✗</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">✓ (Passkeys)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Phishing Resistant</td>
                <td className="py-3 px-4 text-emerald-400">✓</td>
                <td className="py-3 px-4 text-emerald-400 bg-white/[0.02]">✓</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Status (2024)</td>
                <td className="py-3 px-4 text-red-400">Legacy / Deprecated</td>
                <td className="py-3 px-4 text-amber-400 bg-white/[0.02]">Digantikan CTAP2</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">Aktif & Direkomendasikan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 italic lg:hidden mt-2">Geser ke kanan untuk melihat kolom lengkap →</p>
    </div>

    <div id="fido2-architecture" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Arsitektur FIDO2</h2>
      <p className="text-gray-400 leading-relaxed">
        FIDO2 terdiri dari dua komponen utama yang bekerja bersama:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">WebAuthn API (W3C)</h4>
          <p className="text-sm text-gray-400">API JavaScript standar yang tersedia di browser melalui <code className="text-gray-300">navigator.credentials</code>. Menangani komunikasi antara Relying Party (website) dan platform authenticator. Proyek ini menggunakan pustaka <code className="text-gray-300">@simplewebauthn</code> sebagai abstraksi di atas API ini.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-emerald-400 mb-2">CTAP2 (FIDO Alliance)</h4>
          <p className="text-sm text-gray-400">Client to Authenticator Protocol v2 — protokol komunikasi antara platform (browser/OS) dan authenticator eksternal (USB, NFC, BLE). CTAP2 memungkinkan roaming authenticator seperti YubiKey berkomunikasi dengan browser mana pun yang mendukung WebAuthn.</p>
        </div>
      </div>
      <div className="p-4 bg-violet-500/[0.06] border border-violet-500/15 rounded-xl mt-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-violet-400">Posisi Proyek Ini:</strong> Proyek ini mengimplementasikan sisi <strong className="text-white">WebAuthn API</strong> (Relying Party) menggunakan <code>@simplewebauthn/server</code> di backend dan <code>@simplewebauthn/browser</code> di frontend. CTAP2 ditangani secara transparan oleh browser dan sistem operasi pengguna.
        </p>
      </div>
    </div>
  </div>
);

export default FidoComparisonSection;
