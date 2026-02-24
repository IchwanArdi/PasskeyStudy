import { useState, useEffect } from 'react';
import api from '../services/api';

const Comparison = () => {
  const [selectedCategory, setSelectedCategory] = useState('security');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stats/comparison-data?viewMode=global');
        setComparisonData(response.comparisonData);
        setError(null);
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError(err.message || 'Gagal memuat data perbandingan');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  const categories = [
    { id: 'security', label: 'Keamanan', icon: '🔒' },
    { id: 'performance', label: 'Performa', icon: '⚡' },
    { id: 'ux', label: 'User Experience', icon: '👤' },
    { id: 'cost', label: 'Biaya', icon: '💰' },
  ];

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

  if (loading) {
    return (
      <div className="comparison-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="comparison-page" style={{ padding: '2rem', textAlign: 'center' }}>
         <div className="alert alert-danger">
           <h3>Error Memuat Data</h3>
           <p>{error}</p>
         </div>
       </div>
     );
  }

  if (!comparisonData || comparisonData.security.length === 0) {
    return (
      <div className="comparison-page" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="alert alert-warning">
          <h3>Data Tidak Cukup (Insufficient Data)</h3>
          <p>Belum ada log autentikasi atau respon survei yang memadai untuk melakukan perbandingan analitis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-page">
      <div className="container">
        <div className="page-header">
          <h1>Perbandingan Password vs WebAuthn</h1>
          <p className="page-subtitle">Analisis mendalam perbandingan antara autentikasi password tradisional dan WebAuthn/FIDO2 berdasarkan Data Agregasi Real-Time.</p>
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
