import { Code } from 'lucide-react';

const EndpointRow = ({ method, path, description, auth = true }) => (
  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col sm:flex-row sm:items-center gap-2">
    <div className="flex items-center gap-2 shrink-0">
      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
        method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
        method === 'POST' ? 'bg-green-500/10 text-green-400' :
        method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
        'bg-red-500/10 text-red-400'
      }`}>{method}</span>
      <code className="text-sm text-gray-300">{path}</code>
    </div>
    <span className="text-xs text-gray-500 sm:ml-auto">{description}{auth ? '' : ' (public)'}</span>
  </div>
);

const ApiReferenceSection = () => (
  <div id="api" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/[0.08] border border-red-500/20 rounded-full text-red-400 text-xs font-semibold">
        <Code className="w-3 h-3" />
        Referensi
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">API Reference</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Daftar lengkap seluruh endpoint API backend yang tersedia. Semua endpoint (kecuali ditandai "public") memerlukan header <code className="text-blue-400">Authorization: Bearer &lt;JWT&gt;</code>.
      </p>
    </div>

    <div id="endpoints" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Ringkasan Modul Router</h2>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Modul</th>
              <th className="py-3 px-4">Prefix</th>
              <th className="py-3 px-4 bg-white/[0.02]">Jumlah Endpoint</th>
              <th className="py-3 px-4">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">auth.js</td><td className="py-2 px-4 text-gray-400">/api/auth</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">6</td><td className="py-2 px-4 text-gray-400">Registrasi & Login (Password + WebAuthn)</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">user.js</td><td className="py-2 px-4 text-gray-400">/api/user</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">7</td><td className="py-2 px-4 text-gray-400">Profil, Credential & Device Management</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">recovery.js</td><td className="py-2 px-4 text-gray-400">/api/auth/recovery</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">4</td><td className="py-2 px-4 text-gray-400">Pemulihan Akun (Recovery Codes)</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">stats.js</td><td className="py-2 px-4 text-gray-400">/api/stats</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">2</td><td className="py-2 px-4 text-gray-400">Agregasi Data Dashboard</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">security.js</td><td className="py-2 px-4 text-gray-400">/api/security</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">4</td><td className="py-2 px-4 text-gray-400">Simulasi Serangan & Analisis Keamanan</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">performance.js</td><td className="py-2 px-4 text-gray-400">/api/performance</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">2</td><td className="py-2 px-4 text-gray-400">Latensi & Ukuran Payload</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">ux.js</td><td className="py-2 px-4 text-gray-400">/api/ux</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">10</td><td className="py-2 px-4 text-gray-400">Survei SUS, Beban Kognitif, Task Completion</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">cost.js</td><td className="py-2 px-4 text-gray-400">/api/cost</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">4</td><td className="py-2 px-4 text-gray-400">Analisis Biaya & ROI</td></tr>
            <tr><td className="py-2 px-4 font-medium text-white bg-white/[0.02]">compatibility.js</td><td className="py-2 px-4 text-gray-400">/api/compatibility</td><td className="py-2 px-4 text-gray-400 bg-white/[0.02]">3</td><td className="py-2 px-4 text-gray-400">Kompatibilitas Browser & Aksesibilitas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="auth-api" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Auth API <code className="text-sm text-gray-500 font-normal">/api/auth</code></h2>
      <div className="space-y-2">
        <EndpointRow method="POST" path="/api/auth/register" description="Registrasi user (email + password + username)" auth={false} />
        <EndpointRow method="POST" path="/api/auth/login" description="Login password (email + password)" auth={false} />
        <EndpointRow method="POST" path="/api/auth/webauthn/register/options" description="Generate registration options (challenge)" auth={false} />
        <EndpointRow method="POST" path="/api/auth/webauthn/register/verify" description="Verifikasi attestation response" auth={false} />
        <EndpointRow method="POST" path="/api/auth/webauthn/login/options" description="Generate authentication options" auth={false} />
        <EndpointRow method="POST" path="/api/auth/webauthn/login/verify" description="Verifikasi assertion response → JWT" auth={false} />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">User & Device API <code className="text-sm text-gray-500 font-normal">/api/user</code></h2>
      <div className="space-y-2">
        <EndpointRow method="GET" path="/api/user/me" description="Profil user saat ini" />
        <EndpointRow method="PUT" path="/api/user/me" description="Update profil (username, email)" />
        <EndpointRow method="GET" path="/api/user/credentials" description="Daftar credential WebAuthn user" />
        <EndpointRow method="DELETE" path="/api/user/credentials/:id" description="Hapus credential (revoke device)" />
        <EndpointRow method="PUT" path="/api/user/credentials/:id/nickname" description="Update nama perangkat" />
        <EndpointRow method="POST" path="/api/user/credentials/add-options" description="Options untuk tambah perangkat baru" />
        <EndpointRow method="POST" path="/api/user/credentials/add-verify" description="Verifikasi & simpan credential baru" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Recovery API <code className="text-sm text-gray-500 font-normal">/api/auth/recovery</code></h2>
      <div className="space-y-2">
        <EndpointRow method="POST" path="/api/auth/recovery/generate-codes" description="Generate recovery codes (SHA-256 hashed)" />
        <EndpointRow method="POST" path="/api/auth/recovery/verify-code" description="Verifikasi recovery code" auth={false} />
        <EndpointRow method="POST" path="/api/auth/recovery/re-register-options" description="Options registrasi ulang authenticator" />
        <EndpointRow method="POST" path="/api/auth/recovery/re-register" description="Daftarkan authenticator pengganti" />
      </div>
    </div>

    <div id="stats-api" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Stats API <code className="text-sm text-gray-500 font-normal">/api/stats</code></h2>
      <div className="space-y-2">
        <EndpointRow method="GET" path="/api/stats/my-stats" description="Statistik milik user yang sedang login" />
        <EndpointRow method="GET" path="/api/stats/global-stats" description="Statistik global dashboard (semua user)" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Security API <code className="text-sm text-gray-500 font-normal">/api/security</code></h2>
      <div className="space-y-2">
        <EndpointRow method="POST" path="/api/security/brute-force-simulation" description="Simulasi serangan brute force" />
        <EndpointRow method="GET" path="/api/security/phishing-resistance" description="Analisis ketahanan phishing" />
        <EndpointRow method="GET" path="/api/security/vulnerability-assessment" description="Assessment kerentanan komprehensif" />
        <EndpointRow method="GET" path="/api/security/analysis" description="Skor keamanan agregat (overall)" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Performance API <code className="text-sm text-gray-500 font-normal">/api/performance</code></h2>
      <div className="space-y-2">
        <EndpointRow method="GET" path="/api/performance/summary" description="Ringkasan latensi (Avg, P50, P95, P99)" />
        <EndpointRow method="GET" path="/api/performance/comparison" description="Perbandingan WebAuthn vs Password" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">UX Research API <code className="text-sm text-gray-500 font-normal">/api/ux</code></h2>
      <div className="space-y-2">
        <EndpointRow method="POST" path="/api/ux/sus-survey" description="Submit survei SUS (10 jawaban)" />
        <EndpointRow method="GET" path="/api/ux/sus-results" description="Hasil agregat SUS" />
        <EndpointRow method="POST" path="/api/ux/cognitive-load" description="Submit pengukuran beban kognitif" />
        <EndpointRow method="GET" path="/api/ux/cognitive-load-results" description="Hasil agregat beban kognitif" />
        <EndpointRow method="POST" path="/api/ux/task-completion" description="Submit data penyelesaian tugas" />
        <EndpointRow method="GET" path="/api/ux/task-completion-results" description="Hasil agregat task completion" />
        <EndpointRow method="POST" path="/api/ux/demographics" description="Submit data demografi responden" />
        <EndpointRow method="POST" path="/api/ux/session" description="Simpan sesi usabilitas" />
        <EndpointRow method="GET" path="/api/ux/export" description="Ekspor data riset sebagai CSV" />
        <EndpointRow method="GET" path="/api/ux/comprehensive" description="Data riset UX komprehensif" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Cost API <code className="text-sm text-gray-500 font-normal">/api/cost</code></h2>
      <div className="space-y-2">
        <EndpointRow method="GET" path="/api/cost/implementation" description="Analisis biaya implementasi (Capex)" />
        <EndpointRow method="GET" path="/api/cost/operational" description="Analisis biaya operasional (Opex)" />
        <EndpointRow method="GET" path="/api/cost/roi" description="Kalkulasi Return on Investment" />
        <EndpointRow method="GET" path="/api/cost/comparison" description="Perbandingan biaya total 3 tahun" />
      </div>
    </div>

    <div className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Compatibility API <code className="text-sm text-gray-500 font-normal">/api/compatibility</code></h2>
      <div className="space-y-2">
        <EndpointRow method="GET" path="/api/compatibility/browser-matrix" description="Matriks kompatibilitas browser" />
        <EndpointRow method="GET" path="/api/compatibility/device-support" description="Analisis dukungan perangkat/OS" />
        <EndpointRow method="GET" path="/api/compatibility/accessibility" description="Analisis aksesibilitas WCAG" />
      </div>
    </div>
  </div>
);

export default ApiReferenceSection;
