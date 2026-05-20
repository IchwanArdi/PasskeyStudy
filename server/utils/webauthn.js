import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse, } from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers'; // helper untuk konversi data ke format biner

// Nama aplikasi (Relying Party Name)
const rpName = process.env.RP_NAME;
// Domain website yang menggunakan WebAuthn
const rpID = process.env.RP_ID;
// Origin website (harus sama dengan domain frontend)
const origin = process.env.RP_ORIGIN;


// ======================================================
// 1. MEMINTA OPSI REGISTRASI PASSKEY KE BROWSER
// ======================================================

export const getRegistrationOptions = async (user, allowExisting = false) => {

  // ID user harus diubah ke format biner (Uint8Array) karena WebAuthn tidak menerima string biasa
  const userID = isoUint8Array.fromUTF8String(user._id.toString());

  // Jika user sudah pernah punya passkey maka perangkat tersebut dimasukkan ke daftar exclude supaya tidak bisa register passkey yang sama lagi  
  const excludeCredentials = allowExisting
    ? []
    : (user.webauthnCredentials || []).map((cred) => ({
      id: cred.credentialID,      // ID perangkat authenticator
      type: 'public-key',         // tipe credential WebAuthn
      transports: cred.transports || [], // metode komunikasi (usb, nfc, internal)
    }));

  // generateRegistrationOptions akan:
  // 1. membuat challenge random
  // 2. menyiapkan data registrasi untuk browser
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID,
    userName: user.nik,
    userDisplayName: user.username,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials, // ini fungsi nya untuk memblokir passkey yang sudah ada
    authenticatorSelection: {
      userVerification: 'preferred', // perangkat disarankan meminta biometrik / PIN
      requireResidentKey: false, // passkey tidak wajib disimpan di perangkat
    },
    supportedAlgorithmIDs: [-7, -257], // algoritma kriptografi yang didukung
  });
};


// ======================================================
// 2. VERIFIKASI HASIL REGISTRASI DARI PERANGKAT
// ======================================================

export const verifyRegistration = async (body, expectedChallenge, user) => {

  // Memverifikasi data registrasi yang dikirim browser
  const verification = await verifyRegistrationResponse({
    response: body,            // data dari browser
    expectedChallenge,         // challenge yang sebelumnya dibuat server
    expectedOrigin: origin,    // origin harus sama dengan website
    expectedRPID: rpID,        // domain harus cocok
    requireUserVerification: false,
  });

  // Jika verifikasi gagal
  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registrasi ditolak perangkat');
  }

  // Data credential yang dibuat perangkat
  const { credential } = verification.registrationInfo;

  // Public key yang dihasilkan perangkat
  // diubah ke Base64 agar bisa disimpan di MongoDB
  const credentialPublicKeyString =
    Buffer.from(credential.publicKey).toString('base64');

  // Jenis perangkat authenticator
  const deviceType =
    body.response?.authenticatorAttachment ||
    body.authenticatorAttachment ||
    'cross-platform';

  // Data credential yang akan disimpan ke database
  return {
    credentialID: credential.id,            // ID passkey
    credentialPublicKey: credentialPublicKeyString, // public key
    counter: credential.counter || 0,       // counter anti replay attack
    deviceType,
    transports: credential.transports || [], // metode komunikasi authenticator
  };
};

// ======================================================
// 3. MEMINTA OPSI LOGIN (AUTHENTICATION)
// ======================================================

export const getAuthenticationOptions = async (user) => {

  // Mengambil semua credential milik user dari database
  const allowCredentials = (user.webauthnCredentials || []).map((cred) => ({
    id: cred.credentialID,   // ID credential
    type: 'public-key',
    transports: cred.transports || [],
  }));

  // generateAuthenticationOptions akan:
  // 1. membuat challenge baru
  // 2. menentukan credential mana yang boleh login
  return generateAuthenticationOptions({
    rpID,                // domain website
    timeout: 60000,      // waktu login
    allowCredentials,    // daftar passkey milik user
    userVerification: 'preferred',
  });
};

// ======================================================
// 4. VERIFIKASI LOGIN PASSWORDLESS
// ======================================================

export const verifyAuthentication = async (body, expectedChallenge, user, credential) => {

  // Pastikan credential ada di database
  if (!credential?.credentialID || !credential?.credentialPublicKey) {
    throw new Error('Pengguna tidak memiliki data yang valid untuk login');
  }

  // public key disimpan di DB berupa Base64 diubah kembali ke format biner untuk verifikasi kriptografi
  const publicKeyBytes = new Uint8Array(
    Buffer.from(credential.credentialPublicKey, 'base64')
  );

  // membuat objek credential untuk proses verifikasi
  const webauthnCredential = {
    id: credential.credentialID,
    publicKey: publicKeyBytes,
    counter: Number(credential.counter) || 0,
    transports: credential.transports || [],
  };

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: webauthnCredential,
      requireUserVerification: false,
    });
  } catch (error) {
    // ini fungsinya untuk menangani error counter mismatch untuk authenticator yang tidak mendukung counter
    if (error.message?.includes('counter') && webauthnCredential.counter > 0) {
      console.warn('Counter mismatch terdeteksi, mencoba ulang dengan counter 0');
      webauthnCredential.counter = 0;
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: webauthnCredential,
        requireUserVerification: false,
      });
    } else {
      throw error;
    }
  }

  // Jika signature tidak valid
  if (!verification.verified) {
    throw new Error('Login gagal, tanda tangan tidak sah');
  }

  return {
    verified: true,
    newCounter:
      verification.authenticationInfo?.newCounter ?? 0,
  };
};