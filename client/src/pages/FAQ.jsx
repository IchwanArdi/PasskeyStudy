import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Tentang WebAuthn',
      questions: [
        {
          q: 'Apa itu WebAuthn/FIDO2?',
          a: 'WebAuthn adalah standar W3C untuk autentikasi web yang memungkinkan user login tanpa password menggunakan cryptographic keys yang tersimpan di device mereka. FIDO2 adalah framework yang mencakup WebAuthn dan CTAP (Client to Authenticator Protocol).',
        },
        {
          q: 'Bagaimana WebAuthn berbeda dengan password?',
          a: 'WebAuthn menggunakan cryptographic key pairs (public/private key) yang tersimpan di device user, sedangkan password adalah string rahasia yang disimpan di server. WebAuthn lebih aman karena private key tidak pernah meninggalkan device dan tidak bisa dicuri melalui data breach.',
        },
        {
          q: 'Apakah WebAuthn aman?',
          a: 'Ya, WebAuthn sangat aman. Private key tidak pernah meninggalkan device user, sehingga tidak bisa dicuri melalui data breach. WebAuthn juga melindungi terhadap phishing karena credential hanya bisa digunakan di domain yang terdaftar.',
        },
        {
          q: 'Browser apa saja yang mendukung WebAuthn?',
          a: 'WebAuthn didukung oleh semua browser modern termasuk Chrome, Firefox, Edge, Safari, dan Opera. Dukungan tersedia sejak 2018-2019 untuk sebagian besar browser.',
        },
      ],
    },
    {
      category: 'Penggunaan',
      questions: [
        {
          q: 'Apa yang saya butuhkan untuk menggunakan WebAuthn?',
          a: 'Anda memerlukan device dengan authenticator support seperti Touch ID (Mac), Face ID (iPhone/iPad), Windows Hello (Windows), atau security key seperti YubiKey. Browser modern juga diperlukan.',
        },
        {
          q: 'Bagaimana cara registrasi dengan WebAuthn?',
          a: 'Pilih tab "WebAuthn / FIDO2" di halaman registrasi, masukkan email Anda, lalu ikuti prompt untuk menggunakan authenticator (Touch ID, Face ID, Windows Hello, dll). Prosesnya sangat cepat dan mudah.',
        },
        {
          q: 'Bisakah saya menggunakan beberapa device?',
          a: 'Ya, Anda bisa registrasi credential untuk beberapa device. Setiap device akan memiliki credential unik, dan Anda bisa login dari device manapun yang sudah terdaftar.',
        },
        {
          q: 'Apa yang terjadi jika saya kehilangan device?',
          a: 'Jika Anda kehilangan device, Anda perlu menggunakan device lain yang sudah terdaftar atau melakukan recovery melalui metode alternatif (jika tersedia). Disarankan untuk registrasi beberapa device sebagai backup.',
        },
      ],
    },
    {
      category: 'Keamanan',
      questions: [
        {
          q: 'Apakah WebAuthn lebih aman dari password?',
          a: 'Ya, WebAuthn secara signifikan lebih aman. Tidak ada password yang bisa dicuri, tidak bisa di-phishing, dan tidak bisa di-brute force. Private key tersimpan aman di device dan tidak pernah dikirim ke server.',
        },
        {
          q: 'Apakah data saya aman dengan WebAuthn?',
          a: 'Sangat aman. Private key tidak pernah meninggalkan device Anda dan tidak disimpan di server. Bahkan jika database di-hack, attacker tidak bisa menggunakan credential untuk login.',
        },
        {
          q: 'Apakah WebAuthn melindungi dari phishing?',
          a: 'Ya, WebAuthn memberikan proteksi kuat terhadap phishing. Credential hanya bisa digunakan di domain yang terdaftar, sehingga situs phishing tidak bisa menggunakan credential Anda.',
        },
        {
          q: 'Bagaimana jika authenticator saya di-hack?',
          a: 'Risiko ini sangat rendah karena private key tersimpan di secure enclave (chip khusus) di device. Bahkan jika device terinfeksi malware, private key tidak bisa diakses karena terisolasi secara hardware.',
        },
      ],
    },
    {
      category: 'Perbandingan',
      questions: [
        {
          q: 'Mana yang lebih cepat: Password atau WebAuthn?',
          a: 'WebAuthn umumnya lebih cepat karena tidak perlu mengetik password. Cukup sentuh sensor atau lihat kamera, proses login selesai dalam 2-4 detik.',
        },
        {
          q: 'Mana yang lebih mudah digunakan?',
          a: 'WebAuthn lebih mudah setelah setup awal. Tidak perlu mengingat password, cukup sentuh atau lihat. Namun, setup awal memerlukan device dengan authenticator support.',
        },
        {
          q: 'Kapan sebaiknya menggunakan Password?',
          a: 'Password masih cocok untuk aplikasi dengan risiko rendah, user dengan device lama, atau ketika budget development sangat terbatas.',
        },
        {
          q: 'Kapan sebaiknya menggunakan WebAuthn?',
          a: 'WebAuthn ideal untuk aplikasi dengan data sensitif, keamanan tinggi, atau ketika ingin memberikan user experience terbaik. Cocok untuk aplikasi finansial, kesehatan, atau enterprise.',
        },
      ],
    },
    {
      category: 'Teknis',
      questions: [
        {
          q: 'Apakah WebAuthn memerlukan HTTPS?',
          a: 'Ya, di production WebAuthn memerlukan HTTPS. Namun untuk development, localhost diizinkan. Ini adalah requirement dari WebAuthn specification untuk keamanan.',
        },
        {
          q: 'Apa perbedaan platform authenticator dan cross-platform authenticator?',
          a: 'Platform authenticator terintegrasi dengan device (Touch ID, Face ID, Windows Hello), sedangkan cross-platform authenticator adalah hardware eksternal seperti USB security keys (YubiKey).',
        },
        {
          q: 'Bagaimana cara kerja WebAuthn secara teknis?',
          a: 'WebAuthn menggunakan cryptographic key pairs. Saat registrasi, device membuat key pair, public key dikirim ke server, private key tetap di device. Saat login, device menandatangani challenge dengan private key, server memverifikasi dengan public key.',
        },
        {
          q: 'Apakah WebAuthn bisa digunakan di mobile?',
          a: 'Ya, WebAuthn didukung di mobile browser modern. iOS Safari mendukung Face ID/Touch ID, Android Chrome mendukung fingerprint/face unlock, dan keduanya mendukung USB security keys.',
        },
      ],
    },
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <div className="page-header">
          <h1>Pertanyaan yang Sering Diajukan (FAQ)</h1>
          <p className="page-subtitle">Temukan jawaban untuk pertanyaan umum tentang WebAuthn/FIDO2 dan perbandingannya dengan password tradisional</p>
        </div>

        <div className="faq-content">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;
                  return (
                    <div key={questionIndex} className="faq-item">
                      <button className={`faq-question ${isOpen ? 'open' : ''}`} onClick={() => toggleQuestion(categoryIndex, questionIndex)}>
                        <span className="faq-q-text">{faq.q}</span>
                        <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>Masih ada pertanyaan? Silakan coba aplikasi ini dan lihat perbandingan langsung antara Password dan WebAuthn di dashboard!</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
