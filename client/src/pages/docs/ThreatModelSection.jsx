import { Shield } from 'lucide-react';

const ThreatModelSection = () => (
  <div id="threat-model" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/[0.08] border border-red-500/20 rounded-full text-red-400 text-xs font-semibold">
        <Shield className="w-3 h-3" />
        Analisis Keamanan
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Model Ancaman</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Analisis formal terhadap vektor serangan dan bagaimana arsitektur WebAuthn memitigasi risiko keamanan pada aplikasi web modern berdasarkan metodologi STRIDE.
      </p>
    </div>

    <div id="stride" className="space-y-6 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Analisis STRIDE</h2>
      <p className="text-gray-400 leading-relaxed">
        STRIDE adalah kerangka pemodelan ancaman yang dikembangkan oleh Microsoft. Setiap huruf merepresentasikan satu kategori ancaman. Tabel berikut menganalisis bagaimana masing-masing ancaman dimitigasi oleh WebAuthn:
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <div className="min-w-[600px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-4 px-4 bg-white/[0.02]">Ancaman</th>
                <th className="py-4 px-4">Deskripsi</th>
                <th className="py-4 px-4 bg-white/[0.02]">Mitigasi WebAuthn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Spoofing</td>
                <td className="py-4 px-4 text-gray-400">Penyerang menyamar sebagai pengguna atau server yang sah untuk mencuri kredensial.</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Origin check dan domain binding memastikan credential hanya merespon domain asli. Tidak ada password yang bisa dicuri.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Tampering</td>
                <td className="py-4 px-4 text-gray-400">Data autentikasi dimodifikasi saat transit (<em>Man-in-the-Middle</em>).</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Digital signature (kriptografi asimetris) menjamin integritas seluruh payload. Modifikasi apa pun membuat signature tidak valid.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Repudiation</td>
                <td className="py-4 px-4 text-gray-400">Pengguna menyangkal telah melakukan login atau transaksi tertentu.</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Kunci privat yang tersimpan aman di TPM/hardware memberikan bukti non-repudiation kriptografis.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Information Disclosure</td>
                <td className="py-4 px-4 text-gray-400">Kebocoran database mengungkap kredensial pengguna (password dump).</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Hanya kunci publik yang disimpan di server. Kebocoran database tidak berisiko credential stuffing atau offline cracking.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Denial of Service</td>
                <td className="py-4 px-4 text-gray-400">Penyerang membanjiri server dengan percobaan login berulang (brute force).</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">WebAuthn tidak bisa di-brute force karena menggunakan challenge unik per sesi dan tidak ada password yang bisa ditebak.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-blue-400 bg-white/[0.02]">Elevation of Privilege</td>
                <td className="py-4 px-4 text-gray-400">Penyerang memperoleh akses tingkat lebih tinggi dari yang seharusnya.</td>
                <td className="py-4 px-4 text-gray-300 bg-white/[0.02]">Credential scoping memastikan setiap credential hanya valid untuk satu Relying Party (domain). Tidak ada cross-origin exploitation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 italic lg:hidden mt-2">Geser ke kanan untuk melihat detail mitigasi →</p>
    </div>

    <div id="mitigations" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Vektor Serangan & Mitigasi Detail</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">1. Phishing Resilience (Origin Binding)</h4>
          <p className="text-sm text-gray-400">WebAuthn mengikat (bind) credential ke origin domain secara kriptografis. Browser secara otomatis menyertakan origin ke dalam <code className="text-gray-300">clientDataJSON</code>. Authenticator tidak akan merespon challenge dari domain yang berbeda — misal, <code>faceb00k.com</code> vs <code>facebook.com</code>. Mekanisme ini disebut <strong className="text-white">Relying Party ID matching</strong> dan beroperasi di level browser/OS, bukan aplikasi, sehingga tidak bisa dibypass oleh social engineering.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">2. Credential Stuffing Mitigation</h4>
          <p className="text-sm text-gray-400">Karena tidak ada password (shared secret) yang ditransmisikan, penyerang tidak dapat menggunakan daftar username/password yang bocor dari situs lain untuk membajak akun. Setiap credential bersifat unik per Relying Party — credential yang dibuat di Situs A tidak bisa digunakan di Situs B.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">3. Replay Attack Prevention</h4>
          <p className="text-sm text-gray-400">Setiap ceremony menggunakan <em>cryptographic nonce</em> (challenge) yang dihasilkan server dan berlaku sekali pakai. Challenge disimpan sementara (dalam <code className="text-gray-300">currentChallenge</code> user) dan dihapus setelah verifikasi. Penyerang yang merekam paket jaringan tidak bisa mengirim ulang karena challenge sudah tidak valid.</p>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">4. Man-in-the-Middle Resistance</h4>
          <p className="text-sm text-gray-400">Bahkan jika penyerang berhasil menyisipkan diri antara pengguna dan server (MitM), mereka tidak dapat menggunakan data yang dicegat. Challenge ditandatangani dengan private key yang tidak pernah meninggalkan perangkat, dan signature hanya valid untuk origin yang spesifik. Kombinasi TLS + origin binding + signature memberikan perlindungan berlapis.</p>
        </div>
      </div>
    </div>

    <div id="recovery-security" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Keamanan Alur Pemulihan</h2>
      <p className="text-gray-400 leading-relaxed">
        Alur pemulihan (<em>recovery flow</em>) seringkali menjadi titik terlemah dalam sistem passwordless. Proyek ini mengimplementasikan <strong className="text-blue-400">Offline Recovery Codes</strong> melalui endpoint:
      </p>
      <div className="space-y-2 mt-3">
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/recovery/generate-codes</code>
          <span className="text-xs text-gray-500 ml-auto">Buat recovery codes (SHA-256 hashed)</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/recovery/verify-code</code>
          <span className="text-xs text-gray-500 ml-auto">Verifikasi kode (unauthenticated)</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/recovery/re-register-options</code>
          <span className="text-xs text-gray-500 ml-auto">Opsi registrasi ulang authenticator</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded">POST</span>
          <code className="text-sm text-gray-300">/api/auth/recovery/re-register</code>
          <span className="text-xs text-gray-500 ml-auto">Daftarkan authenticator baru</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-3">
        Recovery codes di-hash menggunakan SHA-256 sebelum disimpan ke database. Jika database bocor, penyerang tidak bisa langsung memulihkan akun tanpa menebak kode secara brute force.
      </p>
    </div>
  </div>
);

export default ThreatModelSection;
