import { Shield } from 'lucide-react';

const WebAuthnSection = () => (
  <div id="webauthn" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold">
        <Shield className="w-3 h-3" />
        Protokol FIDO2
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">WebAuthn / FIDO2</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Implementasi standar W3C Web Authentication API Level 2 menggunakan pustaka <code className="text-indigo-400">@simplewebauthn/server</code> dan <code className="text-indigo-400">@simplewebauthn/browser</code>.
      </p>
    </div>

    <div id="registration" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Registrasi Kredensial</h2>
      <p className="text-gray-400 leading-relaxed">
        Registrasi WebAuthn (disebut juga <em>attestation ceremony</em>) dilakukan melalui dua tahap API call. Tahap pertama meminta <code className="text-blue-400">registration options</code> dari server, kemudian tahap kedua mengirimkan <code className="text-blue-400">attestation response</code> dari authenticator.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tahap 1: Request Options</p>
          <p className="text-sm text-gray-400 mb-2">Endpoint: <code className="text-blue-400">POST /api/auth/webauthn/register/options</code></p>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
            <p>{'{'}</p>
            <p>  "email": "user@example.com",</p>
            <p>  "username": "namapengguna"</p>
            <p>{'}'}</p>
          </div>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Response (Options Kriptografi)</p>
          <div className="p-3 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
            <p>{'{'}</p>
            <p>  "challenge": "dG90YWxseS...",</p>
            <p>  "rp": {'{'} "name": "WebAuthn", "id": "localhost" {'}'},</p>
            <p>  "user": {'{'} "id": "...", "name": "..." {'}'},</p>
            <p>  "pubKeyCredParams": [{'{'}"alg": -7{'}'}],</p>
            <p>  "attestation": "none"</p>
            <p>{'}'}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tahap 2: Verifikasi Attestation</p>
        <p className="text-sm text-gray-400">Endpoint: <code className="text-blue-400">POST /api/auth/webauthn/register/verify</code></p>
        <p className="text-sm text-gray-400 mt-2">
          Browser memanggil <code className="text-gray-300">startRegistration(options)</code> yang mengaktifkan authenticator perangkat. Response yang dihasilkan berisi <code className="text-gray-300">attestationObject</code> (CBOR-encoded, berisi public key) dan <code className="text-gray-300">clientDataJSON</code> (berisi challenge, origin, dan type). Server memverifikasi kedua nilai ini dan menyimpan credential.
        </p>
      </div>
    </div>

    <div id="login" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Verifikasi Login (Assertion)</h2>
      <p className="text-gray-400 leading-relaxed">
        Login WebAuthn (disebut <em>assertion ceremony</em>) juga menggunakan dua tahap. Server mengirim <em>challenge</em> bersama daftar credential yang diizinkan, lalu authenticator menandatangani challenge tersebut dengan private key.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Get Login Options</p>
          <p className="text-sm text-gray-400"><code className="text-blue-400">POST /api/auth/webauthn/login/options</code></p>
          <p className="text-sm text-gray-400 mt-1">Mengirim email → Menerima challenge + allowCredentials</p>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verify Login</p>
          <p className="text-sm text-gray-400"><code className="text-blue-400">POST /api/auth/webauthn/login/verify</code></p>
          <p className="text-sm text-gray-400 mt-1">Mengirim signed assertion → Memverifikasi signature → JWT</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-3">
        Backend menggunakan <code className="text-gray-300">verifyAuthenticationResponse()</code> untuk memvalidasi: (1) challenge cocok, (2) origin sesuai RP_ORIGIN, (3) signature valid terhadap public key tersimpan, (4) counter bertambah (anti-clone). Setelah sukses, field <code className="text-gray-300">lastUsed</code> diperbarui pada credential.
      </p>
    </div>

    <div id="security" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Keamanan Kriptografi</h2>
      <p className="text-gray-400 leading-relaxed">
        WebAuthn menyediakan keamanan berlapis melalui beberapa mekanisme kriptografi yang bekerja secara simultan:
      </p>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Origin Binding</h4>
          <p className="text-sm text-gray-400">Setiap credential secara kriptografis terikat ke <strong className="text-white">RP ID</strong> (domain). Browser secara otomatis memasukkan origin ke dalam <code className="text-gray-300">clientDataJSON</code>, dan server memverifikasi kesesuaiannya. Jika pengguna dialihkan ke situs phishing (<code>fake-bank.com</code>), authenticator tidak akan menemukan credential yang cocok karena RP ID berbeda dari <code>real-bank.com</code>.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Challenge-Response Protocol</h4>
          <p className="text-sm text-gray-400">Setiap ceremony menggunakan <em>cryptographic nonce</em> (challenge) yang unik dan hanya berlaku sekali (<em>single-use</em>). Ini mencegah <strong className="text-white">replay attack</strong> — penyerang tidak bisa merekam dan mengirim ulang response karena challenge-nya sudah kedaluwarsa.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Signature Counter</h4>
          <p className="text-sm text-gray-400">Setiap assertion menyertakan counter yang bertambah monoton. Server memeriksa apakah counter dari response lebih besar dari counter tersimpan. Jika tidak, ini mengindikasikan kemungkinan <strong className="text-white">kloning authenticator</strong>.</p>
        </div>
      </div>
    </div>
  </div>
);

export default WebAuthnSection;
