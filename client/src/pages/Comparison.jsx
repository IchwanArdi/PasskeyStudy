import { useState } from 'react';

const Comparison = () => {
  const [selectedCategory, setSelectedCategory] = useState('security');

  const categories = [
    { id: 'security', label: 'Keamanan', icon: '🔒' },
    { id: 'performance', label: 'Performa', icon: '⚡' },
    { id: 'ux', label: 'User Experience', icon: '👤' },
    { id: 'cost', label: 'Biaya', icon: '💰' },
  ];

  const comparisonData = {
    security: [
      {
        aspect: 'Proteksi terhadap Phishing',
        password: { value: 'Rendah', description: 'User bisa tertipu memasukkan password di situs palsu', score: 2 },
        webauthn: { value: 'Sangat Tinggi', description: 'Credential tidak bisa digunakan di domain lain', score: 5 },
      },
      {
        aspect: 'Proteksi terhadap Brute Force',
        password: { value: 'Sedang', description: 'Bergantung pada kompleksitas password dan rate limiting', score: 3 },
        webauthn: { value: 'Sangat Tinggi', description: 'Tidak ada password yang bisa di-crack', score: 5 },
      },
      {
        aspect: 'Data Breach Risk',
        password: { value: 'Tinggi', description: 'Password hash bisa dicuri dan di-crack', score: 2 },
        webauthn: { value: 'Sangat Rendah', description: 'Private key tidak pernah meninggalkan device', score: 5 },
      },
      {
        aspect: 'Password Reuse',
        password: { value: 'Tinggi', description: 'User cenderung menggunakan password yang sama', score: 2 },
        webauthn: { value: 'Tidak Ada', description: 'Setiap situs memiliki credential unik', score: 5 },
      },
      {
        aspect: 'Social Engineering',
        password: { value: 'Rentan', description: 'User bisa di-manipulasi untuk membagikan password', score: 2 },
        webauthn: { value: 'Sangat Rendah', description: 'Tidak ada yang bisa dibagikan', score: 5 },
      },
    ],
    performance: [
      {
        aspect: 'Waktu Login Rata-rata',
        password: { value: '5-10 detik', description: 'Termasuk waktu mengetik password', score: 3 },
        webauthn: { value: '2-4 detik', description: 'Hanya sentuh sensor atau lihat kamera', score: 5 },
      },
      {
        aspect: 'Kesalahan Input',
        password: { value: 'Sering', description: 'Typo, caps lock, karakter khusus', score: 2 },
        webauthn: { value: 'Jarang', description: 'Proses otomatis, tidak ada input manual', score: 5 },
      },
      {
        aspect: 'Proses Reset Password',
        password: { value: 'Lama', description: 'Email verification, set password baru, dll', score: 2 },
        webauthn: { value: 'Tidak Perlu', description: 'Tidak ada password yang perlu di-reset', score: 5 },
      },
      {
        aspect: 'Load Server',
        password: { value: 'Sedang', description: 'Perlu hash verification setiap login', score: 3 },
        webauthn: { value: 'Rendah', description: 'Cryptographic verification lebih efisien', score: 4 },
      },
    ],
    ux: [
      {
        aspect: 'Kemudahan Penggunaan',
        password: { value: 'Sedang', description: 'Perlu mengingat dan mengetik password', score: 3 },
        webauthn: { value: 'Sangat Mudah', description: 'Cukup sentuh atau lihat', score: 5 },
      },
      {
        aspect: 'Kemudahan Registrasi',
        password: { value: 'Mudah', description: 'Isi form dan set password', score: 4 },
        webauthn: { value: 'Sangat Mudah', description: 'Cukup email dan authenticator', score: 5 },
      },
      {
        aspect: 'Aksesibilitas',
        password: { value: 'Baik', description: 'Bisa digunakan di semua device', score: 4 },
        webauthn: { value: 'Baik', description: 'Dukungan luas di browser modern', score: 4 },
      },
      {
        aspect: 'Learning Curve',
        password: { value: 'Tidak Ada', description: 'Semua orang sudah familiar', score: 5 },
        webauthn: { value: 'Minimal', description: 'Satu kali setup, kemudian sangat mudah', score: 4 },
      },
      {
        aspect: 'Multi-Device Support',
        password: { value: 'Baik', description: 'Password bisa digunakan di mana saja', score: 4 },
        webauthn: { value: 'Sangat Baik', description: 'Bisa register multiple credentials', score: 5 },
      },
    ],
    cost: [
      {
        aspect: 'Biaya Development',
        password: { value: 'Rendah', description: 'Implementasi standar sudah umum', score: 4 },
        webauthn: { value: 'Sedang', description: 'Perlu library dan setup tambahan', score: 3 },
      },
      {
        aspect: 'Biaya Maintenance',
        password: { value: 'Tinggi', description: 'Reset password, security monitoring, dll', score: 2 },
        webauthn: { value: 'Rendah', description: 'Minimal maintenance setelah setup', score: 4 },
      },
      {
        aspect: 'Biaya Support',
        password: { value: 'Tinggi', description: 'Banyak request reset password', score: 2 },
        webauthn: { value: 'Rendah', description: 'Minimal support request', score: 4 },
      },
      {
        aspect: 'Biaya Security Incident',
        password: { value: 'Sangat Tinggi', description: 'Data breach bisa sangat mahal', score: 1 },
        webauthn: { value: 'Rendah', description: 'Risiko breach jauh lebih kecil', score: 5 },
      },
    ],
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'score-high';
    if (score >= 3) return 'score-medium';
    return 'score-low';
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return 'Sangat Baik';
    if (score >= 3) return 'Baik';
    return 'Perlu Perbaikan';
  };

  return (
    <div className="comparison-page">
      <div className="container">
        <div className="page-header">
          <h1>Perbandingan Password vs WebAuthn</h1>
          <p className="page-subtitle">Analisis mendalam perbandingan antara autentikasi password tradisional dan WebAuthn/FIDO2</p>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((category) => (
            <button key={category.id} className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`} onClick={() => setSelectedCategory(category.id)}>
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="aspect-col">Aspek</th>
                <th className="method-col">
                  <div className="method-header">
                    <span className="method-icon">🔑</span>
                    <span>Password Tradisional</span>
                  </div>
                </th>
                <th className="method-col">
                  <div className="method-header">
                    <span className="method-icon">🔒</span>
                    <span>WebAuthn/FIDO2</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData[selectedCategory].map((item, index) => (
                <tr key={index}>
                  <td className="aspect-cell">
                    <strong>{item.aspect}</strong>
                  </td>
                  <td className="method-cell">
                    <div className="method-content">
                      <div className="method-value">{item.password.value}</div>
                      <div className="method-description">{item.password.description}</div>
                      <div className={`score-badge ${getScoreColor(item.password.score)}`}>
                        {getScoreLabel(item.password.score)} ({item.password.score}/5)
                      </div>
                    </div>
                  </td>
                  <td className="method-cell">
                    <div className="method-content">
                      <div className="method-value">{item.webauthn.value}</div>
                      <div className="method-description">{item.webauthn.description}</div>
                      <div className={`score-badge ${getScoreColor(item.webauthn.score)}`}>
                        {getScoreLabel(item.webauthn.score)} ({item.webauthn.score}/5)
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="comparison-summary">
          <h2>Kesimpulan</h2>
          <div className="summary-grid">
            <div className="summary-card password-summary">
              <h3>Password Tradisional</h3>
              <div className="summary-pros">
                <h4>Kelebihan:</h4>
                <ul>
                  <li>Familiar untuk semua pengguna</li>
                  <li>Implementasi relatif sederhana</li>
                  <li>Bisa digunakan di semua device</li>
                </ul>
              </div>
              <div className="summary-cons">
                <h4>Kekurangan:</h4>
                <ul>
                  <li>Rentan terhadap phishing dan brute force</li>
                  <li>User cenderung reuse password</li>
                  <li>Biaya maintenance dan support tinggi</li>
                  <li>Risiko data breach lebih besar</li>
                </ul>
              </div>
            </div>
            <div className="summary-card webauthn-summary">
              <h3>WebAuthn/FIDO2</h3>
              <div className="summary-pros">
                <h4>Kelebihan:</h4>
                <ul>
                  <li>Keamanan sangat tinggi (no password storage)</li>
                  <li>Proteksi terhadap phishing dan social engineering</li>
                  <li>User experience lebih baik (cepat dan mudah)</li>
                  <li>Biaya maintenance dan support lebih rendah</li>
                  <li>Standar industri yang didukung luas</li>
                </ul>
              </div>
              <div className="summary-cons">
                <h4>Kekurangan:</h4>
                <ul>
                  <li>Perlu device dengan authenticator support</li>
                  <li>Setup awal sedikit lebih kompleks</li>
                  <li>Perlu HTTPS di production</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="use-cases-section">
          <h2>Kapan Menggunakan Masing-masing?</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>Gunakan Password Jika:</h3>
              <ul>
                <li>Target user dengan device lama/tidak support WebAuthn</li>
                <li>Budget development sangat terbatas</li>
                <li>Aplikasi internal dengan risiko rendah</li>
                <li>User base yang sangat konservatif</li>
              </ul>
            </div>
            <div className="use-case-card">
              <h3>Gunakan WebAuthn Jika:</h3>
              <ul>
                <li>Keamanan adalah prioritas utama</li>
                <li>Target user dengan device modern</li>
                <li>Ingin mengurangi biaya support</li>
                <li>Aplikasi dengan data sensitif (finansial, kesehatan, dll)</li>
                <li>Ingin memberikan UX terbaik</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
