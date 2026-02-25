import { Key } from 'lucide-react';

const PasswordSection = () => (
  <div id="password" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-500/[0.08] border border-gray-500/20 rounded-full text-gray-400 text-xs font-semibold">
        <Key className="w-3 h-3" />
        Vektor Pembanding
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Sistem Password</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Implementasi autentikasi berbasis password sebagai <em>baseline</em> pembanding. Login password dinonaktifkan dari antarmuka pengguna, namun data historis digunakan untuk perbandingan empiris.
      </p>
    </div>

    <div id="legacy" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Arsitektur Shared-Secret</h2>
      <p className="text-gray-400 leading-relaxed">
        Sistem password menggunakan arsitektur <em>shared-secret</em>: pengguna dan server sama-sama mengetahui sebuah rahasia (password). Password di-hash menggunakan <strong className="text-white">bcrypt</strong> dengan cost factor 10 sebelum disimpan ke database.
      </p>
      <p className="text-gray-400 leading-relaxed">
        Endpoint password masih tersedia di backend untuk keperluan data perbandingan:
      </p>
      <div className="space-y-2 mt-3">
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/register</code>
          <span className="text-xs text-gray-500 ml-auto">Registrasi dengan email + password</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/login</code>
          <span className="text-xs text-gray-500 ml-auto">Login dengan email + password</span>
        </div>
      </div>

      <div className="p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl mt-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-red-400">Kerentanan Fundamental:</strong> Meskipun bcrypt memperlambat brute force, pendekatan shared-secret tetap rentan terhadap: phishing (pengguna menyerahkan password ke situs palsu), credential stuffing (password yang sama digunakan di banyak situs), keylogger, shoulder surfing, dan kebocoran database (offline cracking).
        </p>
      </div>
    </div>

    <div id="baseline" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Data Baseline untuk Perbandingan</h2>
      <p className="text-gray-400 leading-relaxed">
        Karena fitur login password dinonaktifkan dari antarmuka, dashboard perbandingan memerlukan kumpulan data standar untuk metode ini. Proyek menyediakan <code className="text-blue-400">passwordBaselineSeeder.js</code> yang menyuntikkan data historis komprehensif.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01] mt-3">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Koleksi</th>
              <th className="py-3 px-4">Jumlah Record</th>
              <th className="py-3 px-4 bg-white/[0.02]">Sumber Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">PerformanceLog</td>
              <td className="py-3 px-4 text-gray-400">50 record</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Simulasi pola login berdasarkan standar industri</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white bg-white/[0.02]">AuthLog</td>
              <td className="py-3 px-4 text-gray-400">50 record</td>
              <td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Laporan FIDO Alliance & riset akademis</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-400 mt-3">
        Data baseline ini mencakup variasi realistis: latensi yang bervariasi, rasio keberhasilan/kegagalan, ukuran payload, dan error yang umum terjadi pada autentikasi password seperti "Invalid credentials" dan "Account locked after multiple attempts".
      </p>
    </div>
  </div>
);

export default PasswordSection;
