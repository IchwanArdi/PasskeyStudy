const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <h1>Tentang Penelitian</h1>
          <p className="page-subtitle">Implementasi Sistem Autentikasi Passwordless (WebAuthn/FIDO2) pada Aplikasi Web Fullstack JavaScript</p>
        </div>

        {/* Background Section */}
        <section className="content-section">
          <h2>Latar Belakang</h2>
          <div className="content-text">
            <p>
              Autentikasi berbasis password telah menjadi standar selama beberapa dekade, namun memiliki banyak kelemahan keamanan. Menurut berbagai penelitian, lebih dari 80% data breach disebabkan oleh password yang lemah atau dicuri.
              Masalah seperti phishing, brute force attacks, password reuse, dan social engineering terus menjadi ancaman serius bagi keamanan digital.
            </p>
            <p>
              WebAuthn (Web Authentication) adalah standar W3C yang dikembangkan untuk mengatasi masalah-masalah ini. Dengan menggunakan cryptographic keys yang tersimpan di device user, WebAuthn menghilangkan kebutuhan akan password sambil
              memberikan tingkat keamanan yang jauh lebih tinggi.
            </p>
            <p>
              Penelitian ini bertujuan untuk mengimplementasikan dan membandingkan sistem autentikasi WebAuthn/FIDO2 dengan password tradisional dalam konteks aplikasi web fullstack JavaScript, serta menganalisis perbedaan dalam aspek
              keamanan, performa, dan user experience.
            </p>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="content-section">
          <h2>Tujuan Penelitian</h2>
          <div className="objectives-grid">
            <div className="objective-card">
              <div className="objective-icon">🎯</div>
              <h3>Tujuan Umum</h3>
              <p>Mengimplementasikan sistem autentikasi passwordless menggunakan WebAuthn/FIDO2 pada aplikasi web fullstack JavaScript dan membandingkannya dengan sistem autentikasi password tradisional.</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">📊</div>
              <h3>Tujuan Khusus</h3>
              <ul>
                <li>Mengimplementasikan sistem autentikasi WebAuthn/FIDO2 yang fungsional</li>
                <li>Mengimplementasikan sistem autentikasi password tradisional sebagai pembanding</li>
                <li>Menganalisis perbedaan keamanan antara kedua metode</li>
                <li>Mengukur dan membandingkan performa kedua metode autentikasi</li>
                <li>Menganalisis user experience dari kedua metode</li>
                <li>Menyediakan dashboard analitik untuk monitoring dan perbandingan</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="content-section">
          <h2>Manfaat Penelitian</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Manfaat Teoritis</h3>
              <ul>
                <li>Memberikan kontribusi pada penelitian tentang autentikasi passwordless</li>
                <li>Menambah literatur tentang implementasi WebAuthn/FIDO2</li>
                <li>Memberikan data empiris untuk perbandingan metode autentikasi</li>
              </ul>
            </div>
            <div className="benefit-card">
              <h3>Manfaat Praktis</h3>
              <ul>
                <li>Memberikan referensi implementasi WebAuthn untuk developer</li>
                <li>Membantu organisasi dalam keputusan adopsi teknologi autentikasi</li>
                <li>Meningkatkan kesadaran tentang keamanan autentikasi modern</li>
                <li>Menyediakan tool untuk testing dan evaluasi metode autentikasi</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="content-section">
          <h2>Metodologi Penelitian</h2>
          <div className="methodology-steps">
            <div className="method-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Studi Literatur</h3>
                <p>Mempelajari standar WebAuthn/FIDO2, best practices, dan penelitian terkait autentikasi passwordless.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Perancangan Sistem</h3>
                <p>Merancang arsitektur aplikasi dengan dual authentication system (Password dan WebAuthn) beserta sistem logging dan analitik.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Implementasi</h3>
                <p>Mengimplementasikan aplikasi web fullstack menggunakan Node.js/Express untuk backend dan React untuk frontend, dengan integrasi WebAuthn menggunakan library @simplewebauthn.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Testing & Pengumpulan Data</h3>
                <p>Melakukan testing kedua metode autentikasi dan mengumpulkan data performa, keamanan, dan user experience.</p>
              </div>
            </div>
            <div className="method-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Analisis & Evaluasi</h3>
                <p>Menganalisis data yang dikumpulkan dan membandingkan kedua metode dalam berbagai aspek untuk menghasilkan kesimpulan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="content-section">
          <h2>Teknologi yang Digunakan</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li>Node.js - Runtime environment</li>
                <li>Express.js - Web framework</li>
                <li>MongoDB - Database</li>
                <li>Mongoose - ODM untuk MongoDB</li>
                <li>@simplewebauthn/server - WebAuthn library</li>
                <li>JWT - Token authentication</li>
                <li>bcryptjs - Password hashing</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>React.js - UI framework</li>
                <li>React Router - Routing</li>
                <li>@simplewebauthn/browser - WebAuthn client</li>
                <li>Recharts - Data visualization</li>
                <li>Axios - HTTP client</li>
                <li>React Toastify - Notifications</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Tools & Utilities</h3>
              <ul>
                <li>Vite - Build tool</li>
                <li>ESLint - Code linting</li>
                <li>Nodemon - Development server</li>
                <li>Git - Version control</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Scope Section */}
        <section className="content-section">
          <h2>Ruang Lingkup</h2>
          <div className="scope-content">
            <div className="scope-included">
              <h3>✅ Yang Termasuk</h3>
              <ul>
                <li>Implementasi autentikasi password tradisional</li>
                <li>Implementasi autentikasi WebAuthn/FIDO2</li>
                <li>Sistem logging dan analitik</li>
                <li>Dashboard perbandingan dan visualisasi data</li>
                <li>Support untuk platform authenticators (Touch ID, Face ID, Windows Hello)</li>
                <li>Support untuk cross-platform authenticators (USB keys)</li>
              </ul>
            </div>
            <div className="scope-excluded">
              <h3>❌ Yang Tidak Termasuk</h3>
              <ul>
                <li>Implementasi 2FA untuk password (di luar scope penelitian)</li>
                <li>Mobile app native (fokus pada web application)</li>
                <li>Advanced security features seperti biometric liveness detection</li>
                <li>Enterprise features seperti SSO, LDAP integration</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Expected Results Section */}
        <section className="content-section">
          <h2>Hasil yang Diharapkan</h2>
          <div className="results-content">
            <p>Penelitian ini diharapkan dapat menghasilkan aplikasi web yang mengimplementasikan kedua metode autentikasi (Password dan WebAuthn) dengan sistem analitik yang komprehensif. Aplikasi ini akan menyediakan:</p>
            <ul>
              <li>Data perbandingan keamanan antara Password dan WebAuthn</li>
              <li>Data perbandingan performa (waktu login, success rate)</li>
              <li>Analisis user experience dari kedua metode</li>
              <li>Dashboard visualisasi untuk monitoring dan analisis</li>
              <li>Dokumentasi implementasi yang dapat dijadikan referensi</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
