import { useState } from 'react';
import { securityAPI } from '../services/api';
import { Shield, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import MetricInfoButton from './MetricInfoButton';

const SecurityAnalysisTab = ({ securityData, loadingSecurity }) => {
  const [runningBruteForce, setRunningBruteForce] = useState(false);
  const [bruteForceResult, setBruteForceResult] = useState(null);

  const runBruteForceSimulation = async (method) => {
    setRunningBruteForce(true);
    setBruteForceResult(null);
    try {
      const result = await securityAPI.runSimulation(method);
      setBruteForceResult(result);
      toast.success(`Simulasi ${method.toUpperCase()} selesai`);
    } catch (error) {
      toast.error('Simulasi gagal');
    } finally {
      setRunningBruteForce(false);
    }
  };

  if (loadingSecurity) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Menganalisis data keamanan...</p>
        </div>
      </div>
    );
  }

  if (!securityData) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <p className="text-sm font-medium text-gray-600 text-center">Data keamanan belum tersedia. Klik tab untuk memuat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Security Score */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold">Benchmark Ketahanan</h3>
          <MetricInfoButton
            title="Benchmark Ketahanan Keamanan"
            description="Skor benchmark keamanan yang membandingkan ketahanan WebAuthn/FIDO2 vs Password terhadap berbagai vektor serangan. Skor dihitung berdasarkan: ketahanan phishing, imunitas brute force, dan kekuatan kriptografi. Rating: Excellent (90-100), Good (70-89), Fair (50-69), Poor (<50)."
            relevance="Benchmark ini mengimplementasikan kriteria evaluasi keamanan berdasarkan NIST SP 800-63B (Digital Identity Guidelines). WebAuthn mendapatkan skor tinggi karena: (1) Menggunakan public-key cryptography alih-alih shared secrets, (2) Challenge-response protocol yang mencegah replay attacks, (3) Origin-bound credentials yang mencegah phishing. Password mendapatkan skor rendah karena bersifat 'something you know' yang dapat dicuri, dilupakan, atau ditebak."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* WebAuthn Score */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-blue-400">WebAuthn / FIDO2</h4>
              <span className="text-xs font-medium text-gray-600">Protokol V2</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{securityData.securityScore.webauthn.overall}</span>
              <span className="text-gray-500 font-semibold text-sm">Rating: {securityData.securityScore.webauthn.rating}</span>
            </div>
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                  <span className="flex items-center gap-1">Ketahanan Phishing
                    <MetricInfoButton
                      title="Ketahanan Phishing"
                      description="Persentase ketahanan metode autentikasi terhadap serangan phishing. Phishing adalah serangan di mana penyerang membuat situs palsu untuk mencuri kredensial pengguna."
                      relevance="WebAuthn secara desain IMUN terhadap phishing karena menggunakan origin binding: private key hanya merespon challenge dari domain yang terdaftar (RP ID). Jika pengguna diarahkan ke 'fake-bank.com', authenticator menolak karena domain tidak cocok dengan 'real-bank.com'. Skor 100% untuk WebAuthn menunjukkan perlindungan kriptografis, bukan sekadar deteksi heuristik."
                    />
                  </span>
                  <span className="text-white">{securityData.securityScore.webauthn.phishingResistance}%</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${securityData.securityScore.webauthn.phishingResistance}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                  <span className="flex items-center gap-1">Imunitas Brute Force
                    <MetricInfoButton
                      title="Imunitas Brute Force"
                      description="Persentase ketahanan terhadap serangan brute force, yaitu percobaan menebak credential secara berulang dengan semua kemungkinan kombinasi."
                      relevance="Password rentan terhadap brute force karena keyspace-nya terbatas (misal: 8 karakter alfanumerik = 2.8 triliun kombinasi, bisa dipecahkan dalam hitungan jam). WebAuthn imun 100% karena menggunakan kunci kriptografi 256-bit (2^256 kemungkinan = secara komputasi mustahil). Selain itu, private key tidak pernah meninggalkan authenticator, sehingga tidak ada yang bisa di-brute-force dari sisi server."
                    />
                  </span>
                  <span className="text-white">{securityData.securityScore.webauthn.bruteForceResistance}%</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${securityData.securityScore.webauthn.bruteForceResistance}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Legacy Score */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-500">Password (Legacy)</h4>
              <span className="text-xs font-medium text-gray-600">Protokol V1</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-400">{securityData.securityScore.password.overall}</span>
              <span className="text-gray-600 font-semibold text-sm">Rating: {securityData.securityScore.password.rating}</span>
            </div>
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                  <span>Ketahanan Phishing</span>
                  <span>{securityData.securityScore.password.phishingResistance}%</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2">
                  <div className="bg-gray-600 h-full rounded-full transition-all" style={{ width: `${securityData.securityScore.password.phishingResistance}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                  <span>Imunitas Brute Force</span>
                  <span>{securityData.securityScore.password.bruteForceResistance}%</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2">
                  <div className="bg-gray-600 h-full rounded-full transition-all" style={{ width: `${securityData.securityScore.password.bruteForceResistance}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-gray-400 leading-relaxed">Kesimpulan: {securityData.securityScore.comparison.conclusion}</p>
        </div>
      </div>

      {/* Attack Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold">Vektor Serangan</h3>
              <MetricInfoButton
                title="Simulasi Vektor Serangan"
                description="Simulasi brute force attack terhadap kedua metode autentikasi. Sistem menguji berapa percobaan yang diperlukan, kecepatan serangan, dan tingkat ketahanan. Simulasi ini bersifat aman (tidak benar-benar membobol akun) dan bertujuan edukatif."
                relevance="Simulasi ini mendemonstrasikan perbedaan fundamental: serangan brute force terhadap password mencoba kombinasi string (feasible), sedangkan terhadap WebAuthn harus memecahkan ECDSA P-256 atau RSA-2048 (infeasible). Durasi dan jumlah percobaan yang ditampilkan membuktikan secara empiris bahwa WebAuthn secara kriptografis lebih kuat."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => runBruteForceSimulation('password')}
                disabled={runningBruteForce}
                className="px-3 py-2 bg-red-500/[0.06] border border-red-500/15 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                Simulasi Password
              </button>
              <button
                onClick={() => runBruteForceSimulation('webauthn')}
                disabled={runningBruteForce}
                className="px-3 py-2 bg-blue-500/[0.06] border border-blue-500/15 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/10 transition-all disabled:opacity-50"
              >
                Simulasi WebAuthn
              </button>
            </div>
          </div>

          {bruteForceResult ? (
            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-4">
              <div className="flex justify-between text-sm font-medium mb-3">
                <span className="text-gray-500">Metode: {bruteForceResult.method}</span>
                <span className={bruteForceResult.resistance === 'Very High' ? 'text-emerald-400' : 'text-amber-400'}>Hasil: {bruteForceResult.resistance}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/[0.02] rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Percobaan</p>
                  <p className="text-base font-bold font-mono text-white">{bruteForceResult.attempts}</p>
                </div>
                <div className="text-center p-3 bg-white/[0.02] rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Latensi</p>
                  <p className="text-base font-bold font-mono text-white">{bruteForceResult.duration}ms</p>
                </div>
                <div className="text-center p-3 bg-white/[0.02] rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Kecepatan</p>
                  <p className="text-base font-bold font-mono text-white">{bruteForceResult.avgTimePerAttempt}ms</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic leading-relaxed pt-3 border-t border-white/[0.06]">{bruteForceResult.vulnerability}</p>
            </div>
          ) : (
            <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-sm font-medium text-gray-600">Menunggu simulasi dijalankan</p>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold">Verifikasi Origin Binding</h3>
            <MetricInfoButton
              title="Origin Binding Verification"
              description="Pemeriksaan mekanisme keamanan inti WebAuthn yang mengikat credential ke origin (domain) tertentu. Tiga aspek yang diperiksa: (1) Man-in-the-Middle resistance — apakah komunikasi aman dari penyadapan, (2) Channel Binding — apakah session TLS terikat ke autentikasi, (3) Credential Scoping — apakah credential hanya valid untuk domain terdaftar."
              relevance="Origin binding adalah fitur fundamental FIDO2 yang membedakannya dari password. Setiap credential (public-private key pair) secara kriptografis terikat ke Relying Party ID (rpID = domain). Ini berarti credential yang dibuat di 'bank.com' sama sekali tidak bisa digunakan di 'evil-bank.com'. Mekanisme ini menghilangkan seluruh kelas serangan phishing dan MitM yang masih efektif terhadap password."
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between py-4 border-b border-white/[0.04] text-sm font-medium">
              <span className="text-gray-500">Man-in-the-Middle</span>
              <span className="text-emerald-400">Resisten</span>
            </div>
            <div className="flex justify-between py-4 border-b border-white/[0.04] text-sm font-medium">
              <span className="text-gray-500">Channel Binding</span>
              <span className="text-emerald-400">Aktif</span>
            </div>
            <div className="flex justify-between py-4 text-sm font-medium">
              <span className="text-gray-500">Credential Scoping</span>
              <span className="text-emerald-400">Hard Bound</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAnalysisTab;
