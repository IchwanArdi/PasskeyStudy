import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: false },
  role: { type: String, enum: ["warga", "admin"], default: "warga" },
  authMethod: { type: String, enum: ["webauthn", "password", "hybrid"], default: "webauthn" },
  webauthnCredentials: [webauthnCredentialSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginIP: { type: String },
  lastLoginUA: { type: String },
  backupCodes: [
    {
      code: String,
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Hook untuk hash password sebelum disimpan
userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew || this.isModified()) {
    this.updatedAt = Date.now();
  }
});

// Membandingkan password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Menambah kredensial WebAuthn baru
userSchema.methods.addWebAuthnCredential = async function (credential) {
  const existingCred = this.webauthnCredentials.find(
    (cred) => cred.credentialID === credential.credentialID
  );
  if (existingCred) throw new Error("Perangkat sudah terdaftar");
  this.webauthnCredentials.push(credential);
  return this.save();
};

// Cari kredensial berdasarkan ID
userSchema.methods.findCredential = function (credentialID) {
  return this.webauthnCredentials.find((cred) => cred.credentialID === credentialID);
};

// Update counter kredensial
userSchema.methods.updateCredentialCounter = function (credentialID, counter) {
  const credential = this.findCredential(credentialID);
  if (credential) {
    credential.counter = counter;
    return this.save();
  }
  return null;
};

// Hapus pendaftaran perangkat
userSchema.methods.removeWebAuthnCredential = async function (credentialID) {
  const index = this.webauthnCredentials.findIndex((cred) => cred.credentialID === credentialID);
  if (index === -1) throw new Error("Perangkat tidak ditemukan");

  // Jangan hapus perangkat terakhir jika tidak punya password
  if (!this.password && this.webauthnCredentials.length <= 1) {
    throw new Error("Tidak dapat menghapus perangkat terakhir.");
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

