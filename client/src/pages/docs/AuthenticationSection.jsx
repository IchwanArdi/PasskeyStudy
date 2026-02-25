import { Lock } from 'lucide-react';

const AuthenticationSection = () => (
  <div id="authentication" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold">
        <Lock className="w-3 h-3" />
        Sistem Inti
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Alur Autentikasi</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Arsitektur <em>passwordless-first</em> yang menggantikan mekanisme shared-secret dengan kriptografi kunci publik berbasis hardware.
      </p>
    </div>

    <div id="flow" className="space-y-5 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Alur Registrasi & Login</h2>
      <p className="text-gray-400 leading-relaxed">
        Aplikasi ini menggunakan arsitektur <strong className="text-white">passwordless-only</strong>. Sistem login berbasis password telah secara sengaja dihapus dari antarmuka pengguna untuk memfokuskan penelitian pada WebAuthn/FIDO2. Namun, endpoint password masih tersedia di backend untuk keperluan pengumpulan data perbandingan.
      </p>

      <div className="space-y-4 mt-6">
        <h3 className="text-base font-semibold text-blue-400">Alur Registrasi (Ceremony)</h3>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Input Email', desc: 'Pengguna memasukkan email. Jika belum terdaftar, sistem memulai registration ceremony.' },
            { step: '2', title: 'Generate Options', desc: 'Server memanggil generateRegistrationOptions() untuk membuat challenge dan parameter kriptografi (RP ID, algoritma yang didukung, user info).' },
            { step: '3', title: 'Authenticator Create', desc: 'Browser meneruskan options ke navigator.credentials.create(). Authenticator perangkat (TPM/biometrik) membuat key pair baru.' },
            { step: '4', title: 'Verify & Store', desc: 'Server memverifikasi attestation object menggunakan verifyRegistrationResponse(), menyimpan public key dan credential ID ke database.' },
            { step: '5', title: 'Issue Token', desc: 'Setelah verifikasi berhasil, server menerbitkan JWT token dan mengembalikan sesi autentikasi.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{item.step}</div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-base font-semibold text-emerald-400">Alur Login (Assertion)</h3>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Input Email', desc: 'Pengguna memasukkan email terdaftar.' },
            { step: '2', title: 'Get Login Options', desc: 'Server memanggil generateAuthenticationOptions() dengan allowCredentials berisi credential ID yang terdaftar untuk user tersebut, beserta challenge baru.' },
            { step: '3', title: 'Authenticator Sign', desc: 'Browser meneruskan options ke navigator.credentials.get(). Authenticator menandatangani challenge menggunakan private key yang sesuai.' },
            { step: '4', title: 'Verify Signature', desc: 'Server memverifikasi signature menggunakan public key tersimpan via verifyAuthenticationResponse(). Counter bertambah untuk mendeteksi kloning.' },
            { step: '5', title: 'Session Active', desc: 'JWT token diterbitkan. Field lastUsed diperbarui pada credential yang digunakan.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">{item.step}</div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div id="architecture" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Arsitektur Kunci Publik</h2>
      <p className="text-gray-400 leading-relaxed">
        Berbeda dengan sistem password yang menyimpan <em>shared secret</em> (hash password) di server, WebAuthn menggunakan pasangan kunci asimetris. Private key tidak pernah meninggalkan perangkat pengguna — tersimpan aman di dalam Trusted Platform Module (TPM), Secure Element, atau secure enclave.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Di Sisi Server (Database)</h4>
          <ul className="text-sm text-gray-400 space-y-1.5">
            <li>• <code className="text-gray-300">credentialID</code> — Identifikasi unik credential</li>
            <li>• <code className="text-gray-300">publicKey</code> — Kunci publik (Buffer)</li>
            <li>• <code className="text-gray-300">counter</code> — Penghitung anti-kloning</li>
            <li>• <code className="text-gray-300">nickname</code> — Nama perangkat (user-defined)</li>
            <li>• <code className="text-gray-300">lastUsed</code> — Timestamp terakhir digunakan</li>
          </ul>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-emerald-400 mb-2">Di Sisi Perangkat (Aman)</h4>
          <ul className="text-sm text-gray-400 space-y-1.5">
            <li>• <strong className="text-gray-300">Private Key</strong> — Tidak pernah dikirim keluar</li>
            <li>• <strong className="text-gray-300">Credential Source</strong> — Metadata credential</li>
            <li>• <strong className="text-gray-300">RP ID Binding</strong> — Domain yang terikat</li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl mt-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-emerald-400">Implikasi Keamanan:</strong> Jika database server dibobol (data breach), penyerang hanya mendapatkan kunci publik. Kunci publik <em>tidak dapat digunakan</em> untuk mengautentikasi — berbeda dengan hash password yang masih bisa di-crack secara offline menggunakan GPU cluster atau rainbow tables.
        </p>
      </div>
    </div>
  </div>
);

export default AuthenticationSection;
