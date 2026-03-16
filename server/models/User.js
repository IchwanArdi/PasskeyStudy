import mongoose from "mongoose";
import crypto from "crypto";
import { encrypt, decrypt } from "../utils/encryption.js";
import { createHash } from "../utils/hash.js";


// Schema untuk menyimpan kredensial WebAuthn (sidik jari, FaceID, dll)
const webauthnCredentialSchema = new mongoose.Schema({
  credentialID: { type: String, required: true },
  credentialPublicKey: { type: String, required: true },
  counter: { type: Number, default: 0 },
  deviceType: { type: String, enum: ["platform", "cross-platform"] },
  transports: { type: [String], default: [] },
  nickname: { type: String, default: "Perangkat Saya" },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: null },
});

// Schema Utama User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    // unique dan lowercase dihapus karena isi akan dienkripsi jadi acak
  },
  emailHash: {
    type: String,
    required: true,
    unique: true, // Blind Index untuk pencarian cepat dan memastikan email unik
  },
  role: { type: String, enum: ["warga", "admin"], default: "warga" },
  webauthnCredentials: [webauthnCredentialSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  backupCodes: [
    {
      code: String,
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Hook Mongoose untuk enkripsi, hashing, & timestamp sebelum data tersimpan di DB
userSchema.pre("save", async function () {
  // Update Timestamp
  if (this.isNew || this.isModified()) {
    this.updatedAt = Date.now();
  }

  // Jika kolom email diubah atau ini adalah dokumen baru, enkripsi & buat hash-nya
  if (this.isModified("email")) {
    // 1. Buat hash untuk Blind Index pencarian cepat
    this.emailHash = createHash(this.email);
    
    // 2. Enkripsi email aslinya untuk disimpan di DB
    this.email = encrypt(this.email.toLowerCase().trim());
  }
});

// Otomatis deksripsi saat mengambil data
userSchema.post("init", function (doc) {
  if (doc.email) {
    doc.email = decrypt(doc.email);
  }
});
userSchema.post("save", function (doc) {
  if (doc.email) {
    // Kembalikan ke format terbaca setelah dokumen disave buat respon backend saat object doc masih dipake
    doc.email = decrypt(doc.email);
  }
});

// Menambah kredensial WebAuthn baru
userSchema.methods.addWebAuthnCredential = async function (credential) {
  const existingCred = this.webauthnCredentials.find(
    (cred) => cred.credentialID === credential.credentialID
  );
  if (existingCred) throw new Error("Perangkat sudah terdaftar");
  this.webauthnCredentials.push(credential);
  return this.save();
};



// Hapus pendaftaran perangkat
userSchema.methods.removeWebAuthnCredential = async function (credentialID) {
  const index = this.webauthnCredentials.findIndex((cred) => cred.credentialID === credentialID);
  if (index === -1) throw new Error("Perangkat tidak ditemukan");

  // MENCEGAH TERKUNCI DARI AKUN (LOCKOUT PREVENTION)
  // Aplikasi ini murni Passwordless. User HARUS punya minimal 1 perangkat. 
  // Fitur Recovery dirancang untuk keadaan hilang, bukan untuk dipakai login harian.
  if (this.webauthnCredentials.length <= 1) {
    throw new Error("Peringatan: Anda tidak dapat menghapus satu-satunya perangkat keamanan! Harap tambahkan perangkat ke-2 terlebih dahulu sebelum menghapus perangkat ini.");
  }


  this.webauthnCredentials.splice(index, 1);
  return this.save();
};

// Generate kode pemulihan
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
  return codes;
};

// Generate satu kode pemulihan darurat (biasanya oleh admin)
userSchema.methods.generateEmergencyCode = async function () {
  // Bikin kode 4 karakter simpel
  const code = crypto.randomBytes(2).toString("hex").toUpperCase();
  
  // Masukkan ke daftar backupCodes (di-hash)
  this.backupCodes.push({
    code: crypto.createHash("sha256").update(code).digest("hex"),
    used: false,
    createdAt: new Date(),
  });
  
  await this.save();
  return code;
};

// Verifikasi kode pemulihan
userSchema.methods.useRecoveryCode = async function (plainCode) {
  const hashed = crypto.createHash("sha256").update(plainCode.toUpperCase().trim()).digest("hex");
  const codeEntry = this.backupCodes.find((c) => c.code === hashed && !c.used);
  if (!codeEntry) return false;
  codeEntry.used = true;
  await this.save();
  return true;
};

const User = mongoose.model("User", userSchema);
export default User;

