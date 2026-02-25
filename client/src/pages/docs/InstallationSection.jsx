import { Settings } from 'lucide-react';

const InstallationSection = () => (
  <div id="installation" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/[0.08] border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
        <Settings className="w-3 h-3" />
        Setup & Deploy
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Instalasi</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Panduan lengkap untuk menyiapkan dan menjalankan lingkungan pengembangan proyek WebAuthn secara lokal.
      </p>
    </div>

    <div id="requirements" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Persyaratan Sistem</h2>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 bg-white/[0.02]">Komponen</th>
              <th className="py-3 px-4">Versi Minimum</th>
              <th className="py-3 px-4 bg-white/[0.02]">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr><td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Node.js</td><td className="py-3 px-4 text-gray-400">v18+</td><td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Runtime JavaScript server-side</td></tr>
            <tr><td className="py-3 px-4 font-medium text-white bg-white/[0.02]">MongoDB</td><td className="py-3 px-4 text-gray-400">v6+</td><td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Lokal atau MongoDB Atlas (cloud)</td></tr>
            <tr><td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Browser</td><td className="py-3 px-4 text-gray-400">Chrome 67+</td><td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Harus mendukung WebAuthn API</td></tr>
            <tr><td className="py-3 px-4 font-medium text-white bg-white/[0.02]">Authenticator</td><td className="py-3 px-4 text-gray-400">-</td><td className="py-3 px-4 text-gray-400 bg-white/[0.02]">Windows Hello, Touch ID, YubiKey, dll.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="setup" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Langkah Instalasi</h2>
      <p className="text-gray-400">Proyek menggunakan arsitektur monorepo dengan dua direktori utama: <code className="text-blue-400">client/</code> (React) dan <code className="text-blue-400">server/</code> (Express).</p>
      <div className="p-4 bg-black/50 border border-white/10 rounded-lg overflow-x-auto font-mono text-sm text-gray-300">
        <p className="text-gray-500"># 1. Clone repositori</p>
        <p>git clone https://github.com/IchwanArdi/PasskeyStudy.git</p>
        <p>cd PasskeyStudy</p>
        <br/>
        <p className="text-gray-500"># 2. Install dependensi backend</p>
        <p>cd server && npm install</p>
        <br/>
        <p className="text-gray-500"># 3. Install dependensi frontend</p>
        <p>cd ../client && npm install</p>
        <br/>
        <p className="text-gray-500"># 4. Jalankan development server</p>
        <p>cd ../server && npm run dev    <span className="text-gray-500"># Terminal 1</span></p>
        <p>cd ../client && npm run dev    <span className="text-gray-500"># Terminal 2</span></p>
      </div>
    </div>

    <div id="configuration" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Konfigurasi Environment</h2>
      <p className="text-gray-400">Buat file <code className="text-blue-400">.env</code> di direktori <code className="text-blue-400">server/</code>:</p>
      <div className="p-4 bg-black/50 border border-white/10 rounded-lg font-mono text-sm text-gray-300">
        <p>PORT=5000</p>
        <p>MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;pass&gt;@&lt;cluster&gt;.mongodb.net/?appName=passkey</p>
        <p>JWT_SECRET=your_jwt_secret_key</p>
        <p>NODE_ENV=development</p>
        <p>RP_ID=localhost</p>
        <p>RP_ORIGIN=http://localhost:5173</p>
      </div>
      <div className="p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mt-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-amber-400">Catatan Penting:</strong> <code>RP_ID</code> (Relying Party ID) harus sesuai dengan domain tempat aplikasi berjalan. Untuk pengembangan lokal, gunakan <code>localhost</code>. Nilai ini menentukan <em>scope</em> credential WebAuthn — credential yang dibuat dengan RP_ID tertentu hanya valid untuk domain tersebut. Ini adalah mekanisme keamanan inti yang disebut <strong className="text-white">origin binding</strong>.
        </p>
      </div>
    </div>
  </div>
);

export default InstallationSection;
