import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

// Konfigurasi dasar untuk WebAuthn (Rp = Relying Party / Server Kita)
const rpName = process.env.RP_NAME || 'WebAuthn Passwordless Demo';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5173';

/**
 * 1. FASE REGISTRASI: Meminta perangkat membuat public key baru
 * Menghasilkan 'challenge' acak untuk ditandatangani oleh perangkat (HP/Laptop)
 */
export const getRegistrationOptions = async (user) => {
  if (!user._id || !user.email || !user.username) {
    throw new Error('Data user tidak lengkap untuk registrasi WebAuthn');
  }

  // WebAuthn mensyaratkan ID user dalam format Uint8Array (Biner)
  const userID = isoUint8Array.fromUTF8String(user._id.toString());

  // Kirim daftar perangkat yang sudah terdaftar agar perangkat yang sama tidak daftar ulang
  const excludeCredentials = (user.webauthnCredentials || []).map((cred) => ({
    id: cred.credentialID,
    type: 'public-key',
    transports: cred.transports || [],
  }));

  return generateRegistrationOptions({
    rpName,
    rpID,
    userID,
    userName: user.email,
    userDisplayName: user.username,
    timeout: 60000,
    attestationType: 'none', // 'none' karena kita tidak butuh sertifikat pabrik dari alat FIDO
    excludeCredentials,
    authenticatorSelection: {
      userVerification: 'preferred', // Bebaskan mau validasi pakai PIN/Biometrik/Touch
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257], // Dukung algoritma kriptografi standar umum (ES256 & RS256)
  });
};

/**
 * 2. FASE REGISTRASI: Memverifikasi public key yang dikirim perangkat
 * Mengekstrak Public Key dari respons untuk disimpan ke database MongoDB
 */
// Parameter 'user' diabaikan di sini, namun tetap dibiarkan ada demi kecocokan pemanggil
export const verifyRegistration = async (body, expectedChallenge, user) => {
  // Verifikasi kecocokan tanda tangan perangkat (Body) melawan "Challenge" dari server
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Verifikasi registrasi gagal atau ditolak oleh perangkat');
  }

  // registrationInfo memuat info esensial perangkat yang lolos cek kriptografi
  const { credential } = verification.registrationInfo;

  // Ubah Public Key (Biner/Uint8Array) menjadi teks string (Base64) agar gampang disimpan ke DB
  const credentialPublicKeyString = Buffer.from(credential.publicKey).toString('base64');
  
  // Deteksi darimana asal perangkat (Bawaan Windows/HP atau USB Key)
  const deviceType = body.response?.authenticatorAttachment || body.authenticatorAttachment || 'cross-platform';

  // Siapkan objek alat untuk disimpan ke Array 'webauthnCredentials' di User Model
  return {
    credentialID: credential.id, // ID bawaan library selalu berupa teks Base64URL
    credentialPublicKey: credentialPublicKeyString,
    counter: credential.counter || 0,
    deviceType,
    transports: credential.transports || [],
  };
};

/**
 * 3. FASE LOGIN: Meminta perangkat untuk mensahkan permintaan masuk
 * Mengirim challenge unik khusus ditujukan untuk perangkat yang sudah terdaftar saja
 */
export const getAuthenticationOptions = async (user) => {
  // Kumpulkan list perangkat sah milik akun ini dari Database
  const allowCredentials = (user.webauthnCredentials || []).map((cred) => ({
    id: cred.credentialID,
    type: 'public-key',
    transports: cred.transports || [],
  }));

  // Buat challenge login
  return generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    allowCredentials,
    userVerification: 'preferred',
  });
};

/**
 * 4. FASE LOGIN: Memverifikasi legalitas tanda tangan alat pengguna
 * Memecahkan tanda tangan login dengan Public Key yang terdaftar di database
 */
export const verifyAuthentication = async (body, expectedChallenge, user, credential) => {
  if (!credential || !credential.credentialID || !credential.credentialPublicKey) {
    throw new Error('Data alat FIDO di database tidak lengkap');
  }

  // Kebalikan fase registrasi: Ubah format teks DB (Base64) menjadi angka murni biner (Uint8Array)
  const publicKeyBytes = new Uint8Array(Buffer.from(credential.credentialPublicKey, 'base64'));

  // Susun kembali objek kredensial FIDO sesuai yang diminta library
  const webauthnCredential = {
    id: credential.credentialID,
    publicKey: publicKeyBytes,
    counter: Number(credential.counter) || 0,
    transports: credential.transports || [],
  };

  // Cocokkan keaslian login
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: webauthnCredential,
    requireUserVerification: false,
  });

  if (!verification.verified) {
    throw new Error('Tanda tangan login tidak sah atau perangkat ditolak');
  }

  // Setelah sukses cek login, majukan angka Counter buat meredam hack "perekaman data" (Replay Attack)
  return {
    verified: true,
    newCounter: verification.authenticationInfo?.newCounter || webauthnCredential.counter + 1,
  };
};
