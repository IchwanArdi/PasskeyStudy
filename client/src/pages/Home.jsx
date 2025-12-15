import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Home = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Autentikasi Passwordless dengan <span className="highlight">WebAuthn/FIDO2</span>
          </h1>
          <p className="hero-subtitle">Sistem autentikasi modern yang lebih aman, cepat, dan nyaman dibandingkan password tradisional. Coba dan bandingkan sendiri perbedaannya!</p>
          <div className="hero-actions">
            {!authenticated ? (
              <>
                <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
                  Coba Sekarang
                </button>
                <button className="btn-secondary btn-large" onClick={() => navigate('/comparison')}>
                  Lihat Perbandingan
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary btn-large" onClick={() => navigate('/dashboard')}>
                  Masuk Dashboard
                </button>
                <button className="btn-secondary btn-large" onClick={() => navigate('/comparison')}>
                  Lihat Perbandingan
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Mengapa WebAuthn?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Lebih Aman</h3>
              <p>Tidak ada password yang bisa dicuri atau di-hack. Setiap credential unik dan terikat dengan device Anda. Proteksi terhadap phishing, brute force, dan data breach.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lebih Cepat</h3>
              <p>Login dalam hitungan detik dengan Touch ID, Face ID, atau Windows Hello. Tidak perlu mengetik password yang panjang dan kompleks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>User Experience Lebih Baik</h3>
              <p>Tidak perlu mengingat password. Cukup sentuh sensor atau lihat kamera. Proses yang natural dan intuitif untuk pengguna modern.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Mengurangi Biaya</h3>
              <p>Tidak perlu sistem reset password, mengurangi beban support, dan menurunkan risiko keamanan yang mahal untuk diperbaiki.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Standar Industri</h3>
              <p>WebAuthn adalah standar W3C yang didukung oleh semua browser modern dan platform utama. Masa depan autentikasi digital.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Device</h3>
              <p>Dukung berbagai authenticator: platform authenticators (Touch ID, Face ID, Windows Hello) dan cross-platform keys (YubiKey, dll).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Statistik Keamanan</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">81%</div>
              <div className="stat-label">Data Breach disebabkan oleh password lemah</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3.8 detik</div>
              <div className="stat-label">Rata-rata waktu login dengan WebAuthn</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Pengurangan risiko phishing dengan WebAuthn</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">0</div>
              <div className="stat-label">Password yang perlu diingat dengan WebAuthn</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">Bagaimana Cara Kerjanya?</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Registrasi</h3>
              <p>Daftar dengan email dan gunakan authenticator (Touch ID, Face ID, Windows Hello, atau Security Key)</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Verifikasi</h3>
              <p>Server membuat challenge unik dan mengirim ke browser Anda</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Autentikasi</h3>
              <p>Browser meminta authenticator untuk menandatangani challenge dengan private key yang tersimpan aman</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Login</h3>
              <p>Server memverifikasi signature dan memberikan akses. Proses cepat dan aman!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Siap untuk Mencoba?</h2>
          <p>Daftar sekarang dan bandingkan sendiri perbedaan antara Password tradisional dan WebAuthn</p>
          {!authenticated ? (
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
              Mulai Sekarang
            </button>
          ) : (
            <button className="btn-primary btn-large" onClick={() => navigate('/dashboard')}>
              Lihat Dashboard
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
