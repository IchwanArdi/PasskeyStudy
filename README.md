# 🔐 FIDO2/WebAuthn Passwordless Authentication

**Implementasi Autentikasi Passwordless Berbasis FIDO2/WebAuthn pada Prototipe Website Layanan Administrasi Kelurahan Karangpucung**

> Proyek skripsi yang mengimplementasikan teknologi autentikasi masa depan — login tanpa kata sandi menggunakan biometrik (sidik jari/wajah) berbasis standar [FIDO2/WebAuthn](https://fidoalliance.org/fido2/).

---

## 📋 Tentang Proyek

Proyek ini merupakan implementasi nyata dari standar **FIDO2/WebAuthn** untuk autentikasi passwordless pada konteks layanan administrasi kelurahan di Indonesia. Sistem ini menggantikan kata sandi konvensional dengan verifikasi biometrik perangkat (sidik jari, wajah, atau PIN perangkat), di mana **kunci privat tidak pernah meninggalkan perangkat pengguna**.

### Mengapa Passwordless?

| Ancaman         | Kata Sandi                              | FIDO2/WebAuthn                              |
| --------------- | --------------------------------------- | ------------------------------------------- |
| Phishing        | ❌ Rentan — bisa diketik di situs palsu | ✅ Tahan — credential terkunci ke domain    |
| Replay Attack   | ❌ Rentan — bisa dikirim ulang          | ✅ Tahan — challenge sekali pakai + counter |
| Database Breach | ❌ Rentan — hash bisa di-crack          | ✅ Tahan — private key tidak di server      |
| Brute Force     | ❌ Rentan — bisa ditebak                | ✅ Tahan — kriptografi asimetris            |
| Keylogger       | ❌ Rentan — keystroke direkam           | ✅ Tahan — biometrik, bukan keyboard        |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                     PENGGUNA (Warga)                        │
│            Sidik Jari / Wajah / PIN Perangkat               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              FRONTEND (React.js + Vite)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @simplewebauthn/browser                             │   │
│  │  • startRegistration() — Buat passkey baru           │   │
│  │  • startAuthentication() — Verifikasi biometrik      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS + Origin Validation
┌──────────────────────▼──────────────────────────────────────┐
│              BACKEND (Node.js + Express v5)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @simplewebauthn/server                              │   │
│  │  • generateRegistrationOptions()                     │   │
│  │  • verifyRegistrationResponse()                      │   │
│  │  • generateAuthenticationOptions()                   │   │
│  │  • verifyAuthenticationResponse()                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Keamanan: Helmet │ CORS │ Rate Limiter │ JWT        │   │
│  │  Enkripsi: AES-256-CBC │ HMAC-SHA256 (Blind Index)   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   MongoDB Atlas                             │
│  • Public key saja (private key di perangkat pengguna)      │
│  • NIK terenkripsi AES-256-CBC                              │
│  • Blind Index HMAC-SHA256 untuk pencarian                  │
│  • Recovery codes di-hash SHA-256                           │
│  • TIDAK ADA PASSWORD di database                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Utama

### Autentikasi

- ✅ **Registrasi Passwordless** — Daftar akun dengan NIK + biometrik
- ✅ **Login Biometrik** — Masuk cukup pakai sidik jari atau wajah
- ✅ **Pemulihan Akun** — Recovery codes untuk perangkat hilang/rusak
- ✅ **Kode Darurat Admin** — Admin bisa buatkan kode darurat untuk warga

### Keamanan

- 🔒 **Kriptografi Kunci Publik** — Private key tidak pernah ke server
- 🔒 **Enkripsi AES-256-CBC** — Data kependudukan terenkripsi di database
- 🔒 **Blind Index HMAC-SHA256** — Pencarian data tanpa dekripsi massal
- 🔒 **Challenge-Response** — Setiap login menggunakan challenge acak sekali pakai
- 🔒 **Counter Anti-Replay** — Mencegah penggunaan ulang data autentikasi
- 🔒 **Rate Limiting** — Proteksi brute force (30 req/15min pada auth)
- 🔒 **Helmet + CORS** — HTTP security headers + origin restriction

### Layanan Administrasi

- 📄 Pengajuan Surat Keterangan Tidak Mampu (SKTM)
- 📋 Riwayat dan status pengajuan
- 📥 Unduh surat PDF yang disetujui
- 👤 Manajemen profil dan perangkat
- 🛡️ Dashboard admin dengan otorisasi berbasis peran

---

## 🛠️ Tech Stack

| Layer          | Teknologi                | Versi   |
| -------------- | ------------------------ | ------- |
| **Frontend**   | React.js                 | v19     |
| **Build Tool** | Vite                     | v7      |
| **Styling**    | Tailwind CSS             | v4      |
| **Backend**    | Node.js + Express        | v5      |
| **Database**   | MongoDB (Mongoose)       | v9      |
| **WebAuthn**   | SimpleWebAuthn           | v13.2.2 |
| **Auth Token** | JSON Web Token (JWT)     | v9      |
| **Keamanan**   | Helmet, CORS, Rate Limit | Latest  |
| **PDF**        | pdf-lib                  | v1.17   |
| **Deployment** | Vercel                   | -       |

---

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (Atlas atau lokal)
- Browser modern (Chrome 67+, Edge, Safari, Firefox)
- Perangkat dengan sensor biometrik (opsional, bisa pakai PIN)

### 1. Clone Repository

```bash
git clone https://github.com/IchwanArdi/PasskeyStudy.git
cd PasskeyStudy
```

### 2. Setup Backend

```bash
cd server
npm install
```

Buat file `.env` di folder `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webauthn-demo
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_char_encryption_key
HASH_SECRET=your_hash_secret_for_blind_index
RP_ID=localhost
RP_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Jalankan server:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
```

Buat file `.env` di folder `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Jalankan frontend:

```bash
npm run dev
```

### 4. Buka Aplikasi

Buka browser di `http://localhost:5173`

---

## 📁 Struktur Proyek

```
webauthn-passwordless-demo/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── WebAuthnAuth.jsx     # Komponen utama autentikasi
│   │   │   ├── admin/               # Komponen dashboard admin
│   │   │   └── user/                # Komponen dashboard warga
│   │   ├── pages/
│   │   │   ├── auth/                # Halaman login, register, recovery
│   │   │   ├── admin/               # Halaman admin
│   │   │   └── user/                # Halaman warga
│   │   ├── utils/
│   │   │   └── auth.js              # Axios instance + interceptor JWT
│   │   ├── App.jsx                  # Router utama
│   │   └── App.css                  # Styling global
│   └── package.json
│
├── server/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js              # Koneksi MongoDB
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                  # Schema user + WebAuthn credentials
│   │   └── Pengajuan.js             # Schema pengajuan surat
│   ├── routes/
│   │   ├── auth.js                  # Endpoint registrasi & login WebAuthn
│   │   ├── user.js                  # Endpoint profil & manajemen perangkat
│   │   ├── recovery.js              # Endpoint pemulihan akun
│   │   └── pengajuan.js             # Endpoint pengajuan surat
│   ├── utils/
│   │   ├── webauthn.js              # Logika inti FIDO2/WebAuthn
│   │   ├── encryption.js            # AES-256-CBC enkripsi/dekripsi
│   │   ├── hash.js                  # HMAC-SHA256 Blind Index
│   │   ├── tokenHelper.js           # JWT token generator
│   │   └── pdfGenerator.js          # Generate surat PDF
│   ├── app.js                       # Konfigurasi Express + middleware
│   ├── server.js                    # Entry point server
│   └── package.json
│
└── README.md
```

---

## 🔑 Alur Autentikasi WebAuthn

### Registrasi (Credential Creation)

```
Pengguna                Browser                 Server                Database
   │                      │                       │                      │
   │── Isi NIK + Nama ──→ │                       │                      │
   │                      │── POST /register/options ──→                  │
   │                      │                       │── Generate challenge  │
   │                      │←── challenge + params ─│                      │
   │←── Prompt biometrik ─│                       │                      │
   │── Verifikasi sidik ──→                       │                      │
   │      jari/wajah      │── POST /register/verify ──→                  │
   │                      │                       │── Verifikasi ────────→│
   │                      │                       │   Simpan public key   │
   │                      │←── JWT token ─────────│                      │
   │←── Login berhasil ───│                       │                      │
```

### Login (Authentication)

```
Pengguna                Browser                 Server                Database
   │                      │                       │                      │
   │── Isi NIK ──────────→│                       │                      │
   │                      │── POST /login/options ────→                   │
   │                      │                       │── Challenge baru ────→│
   │                      │←── challenge ─────────│                      │
   │←── Prompt biometrik ─│                       │                      │
   │── Verifikasi ────────→                       │                      │
   │                      │── POST /login/verify ─────→                  │
   │                      │                       │── Verifikasi signature│
   │                      │                       │   dengan public key ─→│
   │                      │                       │── Update counter ────→│
   │                      │←── JWT token ─────────│                      │
   │←── Dashboard ────────│                       │                      │
```

---

## 🧪 Pengujian Keamanan

Sistem telah diuji terhadap **3 skenario serangan** dengan total **9 percobaan**:

### 1. Phishing Attack — ✅ TAHAN

| Percobaan     | Metode                                      | Hasil                           |
| ------------- | ------------------------------------------- | ------------------------------- |
| Origin palsu  | Postman: credential dari `fake-website.com` | Server menolak: origin mismatch |
| CORS bypass   | Browser console dari domain lain            | Request diblokir CORS           |
| Website clone | Frontend di port berbeda                    | Passkey tidak tersedia          |

**Mengapa tahan?** Credential WebAuthn secara kriptografis terikat pada domain (`rpID`). Server memvalidasi `expectedOrigin` dan `expectedRPID`. Private key tidak pernah meninggalkan perangkat.

### 2. Replay Attack — ✅ TAHAN

| Percobaan            | Metode                            | Hasil                                  |
| -------------------- | --------------------------------- | -------------------------------------- |
| Replay data login    | Kirim ulang request yang berhasil | Server menolak: "Sesi habis"           |
| Challenge mismatch   | Credential lama + challenge baru  | Server menolak: "Unexpected challenge" |
| Counter verification | Credential dengan counter rendah  | Server menolak: counter mismatch       |

**Mengapa tahan?** Challenge bersifat random dan sekali pakai (dihapus setelah digunakan). Counter meningkat setiap login berhasil.

### 3. Database Breach — ✅ TAHAN

| Percobaan            | Metode                           | Hasil                               |
| -------------------- | -------------------------------- | ----------------------------------- |
| Ekstrak data         | Akses langsung MongoDB           | NIK terenkripsi, tidak ada password |
| Login data curian    | Credential palsu dari public key | Server menolak: signature invalid   |
| Dekripsi tanpa kunci | Script dekripsi kunci salah      | Gagal: "bad decrypt"                |

**Mengapa tahan?** Tidak ada password di database. Private key tidak pernah disimpan di server. NIK dienkripsi AES-256-CBC. Blind Index bersifat satu arah.

---

## 📚 Referensi & Inspirasi

- [FIDO Alliance](https://fidoalliance.org/) — Standar FIDO2
- [W3C WebAuthn Specification](https://www.w3.org/TR/webauthn-2/) — Spesifikasi WebAuthn Level 2
- [SimpleWebAuthn](https://simplewebauthn.dev/) — Library yang digunakan
- Tran, L., Zhang, B., Pawanja, R., & Khokhar, R. H. (2025). _The Passwordless Authentication with Passkey Technology from an Implementation Perspective_
- Husni. (2024). _Implementasi Autentikasi FIDO2 sebagai Pengganti Kata Sandi_

---

## 📄 Lisensi

Proyek ini dikembangkan sebagai bagian dari penelitian skripsi dan bersifat **open source** untuk keperluan edukasi dan referensi. Silakan gunakan sebagai inspirasi untuk proyek Anda sendiri.

---

## 🤝 Kontribusi

Proyek ini terbuka untuk kontribusi. Jika Anda tertarik dengan teknologi FIDO2/WebAuthn dan ingin mengembangkan lebih lanjut:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

---

<p align="center">
  <i>Dibuat dengan ❤️ untuk masa depan autentikasi yang lebih aman — tanpa kata sandi.</i>
</p>
