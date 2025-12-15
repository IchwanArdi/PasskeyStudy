const SecurityAnalysis = () => {
  const vulnerabilities = [
    {
      title: 'Phishing Attacks',
      password: {
        risk: 'Sangat Tinggi',
        description: 'User bisa tertipu memasukkan password di situs palsu yang terlihat identik dengan situs asli.',
        examples: ['Email phishing', 'Website spoofing', 'Man-in-the-middle'],
        impact: 'Password bisa langsung dicuri dan digunakan oleh attacker',
      },
      webauthn: {
        risk: 'Sangat Rendah',
        description: 'Credential hanya bisa digunakan di domain yang terdaftar. Browser memverifikasi origin sebelum autentikasi.',
        protection: ['Origin verification', 'Domain binding', 'Cryptographic proof'],
        impact: 'Attacker tidak bisa menggunakan credential di domain lain',
      },
    },
    {
      title: 'Brute Force Attacks',
      password: {
        risk: 'Tinggi',
        description: 'Attacker bisa mencoba berbagai kombinasi password sampai menemukan yang benar.',
        examples: ['Dictionary attacks', 'Rainbow table attacks', 'Credential stuffing'],
        impact: 'Password lemah bisa di-crack dalam hitungan menit/jam',
      },
      webauthn: {
        risk: 'Tidak Mungkin',
        description: 'Tidak ada password yang bisa di-crack. Private key tidak pernah meninggalkan device.',
        protection: ['No password to crack', 'Hardware security', 'Rate limiting built-in'],
        impact: 'Tidak ada cara untuk brute force credential',
      },
    },
    {
      title: 'Data Breach',
      password: {
        risk: 'Tinggi',
        description: 'Jika database di-hack, password hash bisa dicuri dan di-crack menggunakan teknik modern.',
        examples: ['Database compromise', 'SQL injection', 'Insider threats'],
        impact: 'Semua password bisa ter-expose, bahkan yang sudah di-hash',
      },
      webauthn: {
        risk: 'Sangat Rendah',
        description: 'Hanya public key yang disimpan di server. Private key tetap di device user.',
        protection: ['Public key only storage', 'No secret on server', 'Device-bound keys'],
        impact: 'Bahkan jika database di-hack, attacker tidak bisa login',
      },
    },
    {
      title: 'Password Reuse',
      password: {
        risk: 'Sangat Tinggi',
        description: 'User cenderung menggunakan password yang sama di berbagai situs.',
        examples: ['Same password for multiple accounts', 'Weak password patterns'],
        impact: 'Breach di satu situs bisa membahayakan semua akun user',
      },
      webauthn: {
        risk: 'Tidak Ada',
        description: 'Setiap situs memiliki credential unik. Tidak ada reuse yang mungkin.',
        protection: ['Unique credential per site', 'Domain-specific keys'],
        impact: 'Breach di satu situs tidak mempengaruhi akun lain',
      },
    },
    {
      title: 'Social Engineering',
      password: {
        risk: 'Tinggi',
        description: 'User bisa di-manipulasi untuk membagikan password melalui telepon, email, atau chat.',
        examples: ['Phone scams', 'Email scams', 'Impersonation'],
        impact: 'Password bisa langsung diberikan ke attacker',
      },
      webauthn: {
        risk: 'Sangat Rendah',
        description: 'Tidak ada yang bisa dibagikan. Autentikasi memerlukan akses fisik ke device.',
        protection: ['No shareable secret', 'Physical device required', 'Biometric verification'],
        impact: 'Attacker perlu akses fisik ke device user',
      },
    },
    {
      title: 'Keyloggers & Malware',
      password: {
        risk: 'Tinggi',
        description: 'Malware bisa mencatat keystroke saat user mengetik password.',
        examples: ['Keyloggers', 'Screen capture malware', 'Browser extensions malicious'],
        impact: 'Password bisa dicatat dan dikirim ke attacker',
      },
      webauthn: {
        risk: 'Rendah',
        description: 'Tidak ada keystroke yang bisa dicatat. Autentikasi menggunakan cryptographic operations.',
        protection: ['No keyboard input', 'Hardware security modules', 'Isolated execution'],
        impact: 'Malware tidak bisa menangkap credential',
      },
    },
  ];

  const securityMetrics = [
    { metric: 'Resistance to Phishing', password: 20, webauthn: 100 },
    { metric: 'Resistance to Brute Force', password: 40, webauthn: 100 },
    { metric: 'Data Breach Impact', password: 30, webauthn: 95 },
    { metric: 'Social Engineering Resistance', password: 25, webauthn: 90 },
    { metric: 'Password Reuse Risk', password: 15, webauthn: 100 },
    { metric: 'Overall Security Score', password: 26, webauthn: 97 },
  ];

  return (
    <div className="security-analysis-page">
      <div className="container">
        <div className="page-header">
          <h1>Analisis Keamanan Mendalam</h1>
          <p className="page-subtitle">Perbandingan detail kerentanan keamanan antara Password tradisional dan WebAuthn/FIDO2</p>
        </div>

        {/* Security Metrics Overview */}
        <section className="metrics-overview">
          <h2>Skor Keamanan (0-100)</h2>
          <div className="metrics-grid">
            {securityMetrics.map((item, index) => (
              <div key={index} className="metric-card">
                <h3>{item.metric}</h3>
                <div className="metric-bars">
                  <div className="metric-bar-container">
                    <div className="metric-label">Password</div>
                    <div className="metric-bar">
                      <div className="metric-fill password-fill" style={{ width: `${item.password}%` }}>
                        {item.password}%
                      </div>
                    </div>
                  </div>
                  <div className="metric-bar-container">
                    <div className="metric-label">WebAuthn</div>
                    <div className="metric-bar">
                      <div className="metric-fill webauthn-fill" style={{ width: `${item.webauthn}%` }}>
                        {item.webauthn}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vulnerability Analysis */}
        <section className="vulnerability-analysis">
          <h2>Analisis Kerentanan</h2>
          {vulnerabilities.map((vuln, index) => (
            <div key={index} className="vulnerability-card">
              <h3>{vuln.title}</h3>
              <div className="vulnerability-comparison">
                <div className="vuln-side password-side">
                  <div className="vuln-header">
                    <span className="vuln-icon">🔑</span>
                    <span className="vuln-title">Password Tradisional</span>
                    <span className={`risk-badge risk-${vuln.password.risk.toLowerCase().replace(' ', '-')}`}>{vuln.password.risk}</span>
                  </div>
                  <div className="vuln-content">
                    <p>{vuln.password.description}</p>
                    <div className="vuln-details">
                      <div className="vuln-examples">
                        <strong>Contoh Serangan:</strong>
                        <ul>
                          {vuln.password.examples.map((ex, i) => (
                            <li key={i}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="vuln-impact">
                        <strong>Dampak:</strong>
                        <p>{vuln.password.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vuln-side webauthn-side">
                  <div className="vuln-header">
                    <span className="vuln-icon">🔒</span>
                    <span className="vuln-title">WebAuthn/FIDO2</span>
                    <span className={`risk-badge risk-${vuln.webauthn.risk.toLowerCase().replace(' ', '-')}`}>{vuln.webauthn.risk}</span>
                  </div>
                  <div className="vuln-content">
                    <p>{vuln.webauthn.description}</p>
                    <div className="vuln-details">
                      <div className="vuln-protection">
                        <strong>Proteksi:</strong>
                        <ul>
                          {vuln.webauthn.protection.map((prot, i) => (
                            <li key={i}>{prot}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="vuln-impact">
                        <strong>Dampak:</strong>
                        <p>{vuln.webauthn.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Best Practices */}
        <section className="best-practices">
          <h2>Best Practices Keamanan</h2>
          <div className="practices-grid">
            <div className="practice-card">
              <h3>Untuk Password (Jika Tetap Digunakan)</h3>
              <ul>
                <li>Gunakan password yang kuat dan unik untuk setiap akun</li>
                <li>Implementasikan rate limiting untuk mencegah brute force</li>
                <li>Gunakan 2FA sebagai lapisan keamanan tambahan</li>
                <li>Hash password dengan algoritma yang kuat (bcrypt, argon2)</li>
                <li>Monitor dan alert untuk aktivitas mencurigakan</li>
                <li>Edukasi user tentang password security</li>
              </ul>
            </div>
            <div className="practice-card">
              <h3>Untuk WebAuthn</h3>
              <ul>
                <li>Pastikan menggunakan HTTPS di production</li>
                <li>Validasi origin dengan benar</li>
                <li>Implementasikan proper challenge management</li>
                <li>Monitor dan log semua autentikasi attempts</li>
                <li>Berikan fallback method untuk user yang tidak support</li>
                <li>Edukasi user tentang cara menggunakan authenticator</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="security-conclusion">
          <h2>Kesimpulan Keamanan</h2>
          <div className="conclusion-content">
            <p>
              Berdasarkan analisis mendalam, <strong>WebAuthn/FIDO2</strong> secara signifikan lebih aman dibandingkan password tradisional. WebAuthn menghilangkan banyak attack vectors yang umum terjadi pada sistem password, seperti
              phishing, brute force, dan password reuse.
            </p>
            <p>
              Meskipun tidak ada sistem yang 100% aman, WebAuthn memberikan tingkat keamanan yang jauh lebih tinggi dengan user experience yang lebih baik. Untuk aplikasi yang memerlukan tingkat keamanan tinggi atau menangani data sensitif,
              WebAuthn adalah pilihan yang jelas lebih baik.
            </p>
            <div className="recommendation-box">
              <h3>💡 Rekomendasi</h3>
              <p>
                Untuk aplikasi modern, pertimbangkan untuk mengadopsi WebAuthn sebagai metode autentikasi utama, dengan password sebagai fallback untuk kompatibilitas. Ini memberikan keamanan terbaik sambil tetap mendukung user dengan
                device yang belum support WebAuthn.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SecurityAnalysis;
