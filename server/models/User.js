import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// SCHEMA WEBAUTHN: Menyimpan blueprint public key dari authenticator perangkat (sidik jari, FaceID) yang didaftarkan user
const webauthnCredentialSchema = new mongoose.Schema({
  credentialID: {
    type: String,
    required: true,
    // Hindari duplikat id dalam subdokumen - dicek otomatis di level aplikasi
  },
  credentialPublicKey: {
    type: String,
    required: true,
  },
  counter: {
    type: Number,
    default: 0,
  },
  deviceType: {
    type: String,
    enum: ["platform", "cross-platform"],
  },
  transports: {
    type: [String],
    default: [],
  },
  nickname: {
    type: String,
    default: "My Authenticator",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
});
// SCHEMA UTAMA: Struktur hierarki data entitas User dalam database MongoDB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: function (v) {
        return v && v.length >= 3 && v.length <= 30;
      },
      message: "Username must be between 3 and 30 characters",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false,
  },
  // RBAC (Role-Based Access Control): Menentukan tingkat wewenang akses pengguna ('warga' atau 'admin')
  role: {
    type: String,
    enum: ["warga", "admin"],
    default: "warga",
  },
  // Atribut kelengkapan sistem autentikasi warga
  authMethod: {
    type: String,
    enum: ["webauthn", "password", "hybrid"],
    default: "webauthn",
  },
  webauthnCredentials: [webauthnCredentialSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginIP: {
    type: String,
  },
  lastLoginUA: {
    type: String,
  },
  backupCodes: [
    {
      code: String,
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// HOOK MONGOOSE: Secara otomatis mengenkripsi (hash) password sebelum di-save ke database menggunakan library bcrypt
userSchema.pre("save", async function (next) {
  try {
    // Hanya enkripsi (hash) jika string password diupdate dan ada isinya
    if (this.isModified("password") && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Perbarui stempel waktu
    if (this.isNew || this.isModified()) {
      this.updatedAt = Date.now();
    }

    // Pastikan antrian 'next' adalah fungsi sebelum dipanggil
    if (typeof next === "function") {
      next();
    }
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    if (typeof next === "function") {
      next(error);
    } else {
      throw error;
    }
  }
});

// Catatan: Warga bebas mendaftar tanpa kata sandi via rute Passwordless (WebAuthn). 
// FIDO biometrik kredensial akan otomatis ditambahkan dalam flow di belakang layar.

// FUNGSI DOMAIN: Membandingkan password yang di-input dengan enkripsi di DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// FUNGSI DOMAIN: Mendaftarkan perangkat baru (HP/Laptop) ke array credentials akun user
userSchema.methods.addWebAuthnCredential = async function (credential) {
  // Cek apakah kredensial yang sama sudah didaftarkan user ini
  const existingCred = this.webauthnCredentials.find(
    (cred) => cred.credentialID === credential.credentialID,
  );

  if (existingCred) {
    throw new Error("Kredensial atau perangkat ini sudah didaftarkan sebelumnya");
  }

  this.webauthnCredentials.push(credential);
  return this.save();
};

// FUNGSI DOMAIN: Cari data spesifik alat FIDO berdasarkan Credential ID
userSchema.methods.findCredential = function (credentialID) {
  return this.webauthnCredentials.find(
    (cred) => cred.credentialID === credentialID,
  );
};

// FUNGSI DOMAIN: Tingkatkan total jumlah klik alat FIDO tiap kali user sukses login
userSchema.methods.updateCredentialCounter = function (credentialID, counter) {
  const credential = this.findCredential(credentialID);
  if (credential) {
    credential.counter = counter;
    return this.save();
  }
  return null;
};

// FUNGSI DOMAIN: Menghancurkan pendaftaran satu spesifik FIDO device
userSchema.methods.removeWebAuthnCredential = async function (credentialID) {
  const index = this.webauthnCredentials.findIndex(
    (cred) => cred.credentialID === credentialID,
  );

  if (index === -1) {
    throw new Error("Credential tidak ditemukan");
  }

  // Hindari menghapus perangkat satu-satunya bagi pengguna murni passwordless
  if (!this.password && this.webauthnCredentials.length <= 1) {
    throw new Error(
      "Tidak dapat menghapus credential terakhir. Tambahkan perangkat lain terlebih dahulu.",
    );
  }

  this.webauthnCredentials.splice(index, 1);
  return this.save();
};

// FUNGSI DOMAIN: Membuat 4 kode alfanumerik acak (Recovery Codes) jika user kehilangan semua perangkat FIDO-nya
userSchema.methods.generateRecoveryCodes = async function () {
  const codes = [];
  for (let i = 0; i < 4; i++) {
    const code = crypto.randomBytes(2).toString("hex").toUpperCase();
    codes.push(code);
  }

  this.backupCodes = codes.map((code) => ({
    code: crypto.createHash("sha256").update(code).digest("hex"),
    used: false,
    createdAt: new Date(),
  }));

  await this.save();
  return codes; // Beri array kodenya (hanya terlihat sekali saat generate)
};

// FUNGSI DOMAIN: Memverifikasi satu kode rekovery jika user terkunci out
userSchema.methods.useRecoveryCode = async function (plainCode) {
  const hashed = crypto
    .createHash("sha256")
    .update(plainCode.toUpperCase().trim())
    .digest("hex");

  const codeEntry = this.backupCodes.find((c) => c.code === hashed && !c.used);
  if (!codeEntry) return false;

  codeEntry.used = true;
  await this.save();
  return true;
};

const User = mongoose.model("User", userSchema);

export default User;
