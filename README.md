<p align="center">
  <img src="https://img.shields.io/badge/WebAuthn-FIDO2-blue?style=for-the-badge&logo=webauthn" alt="WebAuthn FIDO2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</p>

# 🔐 WebAuthn Passwordless — Implementation Prototype

> **Prototipe implementasi sistem autentikasi** berbasis WebAuthn/FIDO2 passwordless pada aplikasi web fullstack JavaScript.

Dibangun sebagai bagian dari penelitian skripsi dengan metodologi R&D (Research and Development) untuk mengkaji implementasi teknis autentikasi modern berbasis kriptografi kunci publik.

---

## ✨ Fitur Utama

| Kategori           | Fitur                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| 🔑 **Autentikasi** | Native FIDO2/WebAuthn (Passkey), Multi-device credential management         |
| ⚡ **Performa**    | Latensi logger endpoints, API Performance tracking                          |
| 🔄 **Recovery**    | Offline recovery codes (SHA-256), Re-registration flow, Multi-device backup |
| 📖 **Dokumentasi** | Dokumentasi teknis terintegrasi                                             |

---

## 🏗️ Arsitektur

```
┌──────────────────────── CLIENT (React 19 + Vite 7) ────────────────────────┐
│                                                                             │
│  Landing Page ──► Login/Register ──► Dashboard                              │
│                                      ├── Ringkasan (Stats)                  │
│                                      └── Performa (Latensi)                 │
│                                                                             │
│  @simplewebauthn/browser ◄──── navigator.credentials API ────► Authenticator│
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ REST API (JWT Bearer)
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                         SERVER (Node.js + Express)                          │
│                                                                             │
│  Routes:  auth · user · recovery · stats · security                         │
│           performance · ux · cost · compatibility                           │
│                                                                             │
│  @simplewebauthn/server ◄──── Verify Attestation / Assertion               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ Mongoose ODM
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                         DATABASE (MongoDB Atlas)                            │
│                                                                             │
│  Collections:  User · AuthLog · PerformanceLog                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prasyarat

| Komponen      | Versi                                 | Keterangan                                                |
| ------------- | ------------------------------------- | --------------------------------------------------------- |
| Node.js       | v18+                                  | Runtime JavaScript                                        |
| MongoDB       | v6+                                   | Lokal atau [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Browser       | Chrome 67+ / Firefox 60+ / Safari 14+ | Harus mendukung WebAuthn API                              |
| Authenticator | —                                     | Windows Hello, Touch ID, Face ID, atau Security Key       |

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/IchwanArdi/PasskeyStudy.git
cd PasskeyStudy

# 2. Install dependensi backend
cd server
npm install

# 3. Install dependensi frontend
cd ../client
npm install
```

### Konfigurasi

Buat file `.env` di folder `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=passkey
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development

# WebAuthn Relying Party Configuration
RP_ID=localhost
RP_NAME=WebAuthn Passwordless Demo
RP_ORIGIN=http://localhost:5173
```

> **⚡ Penting:** `RP_ID` menentukan scope credential WebAuthn. Credential yang dibuat dengan `RP_ID=localhost` hanya valid untuk `localhost`. Untuk production, ubah ke domain Anda.

### Menjalankan

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Buka **http://localhost:5173** di browser.

---

## 📁 Struktur Proyek

```
PasskeyStudy/
├── server/
│   ├── config/
│   │   └── database.js              # Koneksi MongoDB
│   ├── controllers/
│   │   ├── authController.js        # Register & Login (Password)
│   │   ├── webauthnController.js    # WebAuthn Ceremonies
│   │   └── recoveryController.js    # Recovery Code Flow
│   ├── middleware/
│   │   ├── auth.js                  # JWT Authentication Guard
│   │   └── performanceLogger.js     # Latency & Payload Logger
│   ├── models/
│   │   ├── User.js                  # User + WebAuthn Credentials Schema
│   │   ├── AuthLog.js               # Authentication Event Log
│   │   ├── PerformanceLog.js        # API Performance Metrics
│   │   └── UXData.js                # SUS, Cognitive Load, Task Completion
│   ├── routes/
│   │   ├── auth.js                  # /api/auth — Register, Login, WebAuthn
│   │   ├── user.js                  # /api/user — Profile, Device Management
│   │   ├── recovery.js              # /api/auth/recovery — Recovery Codes
│   │   ├── stats.js                 # /api/stats — Dashboard Aggregation
│   │   ├── performance.js           # /api/performance — Latency Stats
│   ├── utils/
│   │   └── webauthn.js              # SimpleWebAuthn Wrapper
│   ├── seeders/
│   │   └── passwordBaselineSeeder.js # Baseline Data Generator
│   └── app.js                       # Express App Entry
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── PerformanceTab.jsx
│       │   └── MetricInfoButton.jsx  # Info Tooltip Component
│       ├── pages/
│       │   ├── Dashboard.jsx         # Main Analytics Dashboard
│       │   ├── ManageDevices.jsx     # Credential Management
│       │   ├── Documentation.jsx     # Docs Shell (14 sections)
│       │   └── docs/                 # Modular Documentation
│       │       ├── IntroductionSection.jsx
│       │       ├── WebAuthnSection.jsx
│       │       ├── ThreatModelSection.jsx
│       │       ├── FidoComparisonSection.jsx
│       │       ├── LimitationsSection.jsx
│       │       ├── ApiReferenceSection.jsx
│       │       └── ... (14 files total)
│       ├── services/
│       │   └── api.js                # Axios API Client
│       └── utils/
│           └── auth.js               # JWT Token Management
│
└── README.md
```

---

## 🔌 API Reference

Seluruh endpoint (kecuali auth) memerlukan header `Authorization: Bearer <JWT>`.

### Auth (`/api/auth`)

| Method | Endpoint                     | Deskripsi                         |
| ------ | ---------------------------- | --------------------------------- |
| `POST` | `/register`                  | Registrasi (email + password)     |
| `POST` | `/login`                     | Login password                    |
| `POST` | `/webauthn/register/options` | Generate registration challenge   |
| `POST` | `/webauthn/register/verify`  | Verify attestation response       |
| `POST` | `/webauthn/login/options`    | Generate authentication challenge |
| `POST` | `/webauthn/login/verify`     | Verify assertion → JWT            |

### User & Devices (`/api/user`)

| Method   | Endpoint                    | Deskripsi                  |
| -------- | --------------------------- | -------------------------- |
| `GET`    | `/me`                       | Profil user                |
| `PUT`    | `/me`                       | Update profil              |
| `GET`    | `/credentials`              | Daftar credential WebAuthn |
| `DELETE` | `/credentials/:id`          | Hapus credential           |
| `PUT`    | `/credentials/:id/nickname` | Rename perangkat           |
| `POST`   | `/credentials/add-options`  | Options tambah perangkat   |
| `POST`   | `/credentials/add-verify`   | Verifikasi perangkat baru  |

### Recovery (`/api/auth/recovery`)

| Method | Endpoint               | Deskripsi                    |
| ------ | ---------------------- | ---------------------------- |
| `POST` | `/generate-codes`      | Generate recovery codes      |
| `POST` | `/verify-code`         | Verifikasi kode (public)     |
| `POST` | `/re-register-options` | Options registrasi ulang     |
| `POST` | `/re-register`         | Daftarkan authenticator baru |

### Security (`/api/security`)

| Method | Endpoint                    | Deskripsi                   |
| ------ | --------------------------- | --------------------------- |
| `POST` | `/brute-force-simulation`   | Simulasi brute force        |
| `GET`  | `/phishing-resistance`      | Analisis ketahanan phishing |
| `GET`  | `/vulnerability-assessment` | Assessment kerentanan       |
| `GET`  | `/analysis`                 | Skor keamanan agregat       |

### Performance (`/api/performance`)

| Method | Endpoint      | Deskripsi                         |
| ------ | ------------- | --------------------------------- |
| `GET`  | `/summary`    | Ringkasan latensi (Avg, P50-P99)  |
| `GET`  | `/comparison` | Perbandingan WebAuthn vs Password |

### UX Research (`/api/ux`)

| Method | Endpoint                   | Deskripsi                         |
| ------ | -------------------------- | --------------------------------- |
| `POST` | `/sus-survey`              | Submit survei SUS (10 pertanyaan) |
| `GET`  | `/sus-results`             | Hasil agregat SUS                 |
| `POST` | `/cognitive-load`          | Submit beban kognitif             |
| `GET`  | `/cognitive-load-results`  | Hasil kognitif                    |
| `POST` | `/task-completion`         | Submit task completion            |
| `GET`  | `/task-completion-results` | Hasil task                        |
| `POST` | `/demographics`            | Data demografi responden          |
| `GET`  | `/export`                  | Export CSV                        |

### Cost (`/api/cost`)

| Method | Endpoint          | Deskripsi                  |
| ------ | ----------------- | -------------------------- |
| `GET`  | `/implementation` | Biaya implementasi (Capex) |
| `GET`  | `/operational`    | Biaya operasional (Opex)   |
| `GET`  | `/roi`            | Return on Investment       |
| `GET`  | `/comparison`     | Perbandingan biaya 3 tahun |

### Compatibility (`/api/compatibility`)

| Method | Endpoint          | Deskripsi                      |
| ------ | ----------------- | ------------------------------ |
| `GET`  | `/browser-matrix` | Matriks kompatibilitas browser |
| `GET`  | `/device-support` | Dukungan perangkat/OS          |
| `GET`  | `/accessibility`  | Analisis aksesibilitas WCAG    |

---

## 🧪 Metrik yang Diukur

### Keamanan

- **Phishing Resistance** — Origin binding mechanism (RP ID matching)
- **Brute Force Immunity** — Key space analysis (2²⁵⁶ vs 95⁸)
- **Vulnerability Score** — STRIDE-based assessment dari data real

### Performa

- **Response Time** — Avg, P50, P95, P99 percentiles
- **Payload Size** — Request/response body size (bytes)
- **Round Trips** — WebAuthn (2) vs Password (1)

### Usabilitas

- **SUS Score** — System Usability Scale 0-100 (John Brooke, 1986)
- **Cognitive Load** — Skala NASA-TLX (mental effort, frustration, dll.)
- **Task Completion** — Waktu, success rate, jumlah error

### Finansial

- **Capex** — Jam pengembangan (Password: 16h, WebAuthn: 32h)
- **Opex** — Support ticket cost berdasarkan data gagal login
- **ROI** — Return on Investment + payback period

---

## 🔒 Konsep Keamanan WebAuthn

```
┌─────────────┐    Challenge    ┌─────────────┐
│   Server     │ ─────────────► │   Browser    │
│ (Relying     │                │              │
│  Party)      │ ◄───────────── │  Authenticator│
│              │  Signed Resp   │  (TPM/Bio)   │
└──────┬───────┘                └──────────────┘
       │
  Stores only:
  • Public Key
  • Credential ID
  • Counter

  NEVER stores:
  • Private Key
  • Biometric Data
  • Password
```

**Mengapa WebAuthn lebih aman?**

- 🛡️ **Origin Binding** — Credential terikat ke domain, immune terhadap phishing
- 🔑 **No Shared Secrets** — Private key tidak pernah meninggalkan perangkat
- 🔄 **Replay Protection** — Challenge unik per sesi (single-use nonce)
- 📊 **Clone Detection** — Signature counter mencegah duplikasi authenticator

---

## 📝 Catatan Penting

- WebAuthn memerlukan **HTTPS di production** (`localhost` diizinkan untuk development)
- Pastikan browser mendukung [WebAuthn API](https://caniuse.com/webauthn)
- Platform authenticator (Touch ID, Face ID, Windows Hello) memerlukan hardware yang kompatibel
- Data baseline password dihasilkan oleh seeder untuk keperluan perbandingan (login password dinonaktifkan dari UI)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repositori ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

---

## 📚 Referensi

- [W3C Web Authentication (WebAuthn)](https://www.w3.org/TR/webauthn-2/)
- [FIDO Alliance — FIDO2 Overview](https://fidoalliance.org/fido2/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Verizon DBIR 2023](https://www.verizon.com/business/resources/reports/dbir/) — 80%+ breaches involve credentials
- [SUS — System Usability Scale (Brooke, 1986)](https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">
  Dibuat dengan ❤️<br/>
  <strong>WebAuthn Passwordless Authentication Research Platform</strong>
</p>
