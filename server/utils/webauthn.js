// Inti dari sistem Passwordless pakai standar FIDO2 / WebAuthn
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

// Settingan Dasar Server (Relying Party)
const rpName = process.env.RP_NAME || 'WebAuthn Passwordless Demo';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5173';

// 1. Minta opsi registrasi ke browser
export const getRegistrationOptions = async (user, allowExisting = false) => {
  if (!user._id || !user.email || !user.username) {
    throw new Error('Data user tidak lengkap');
  }

  // ID user harus biner (Uint8Array) sesuai spek WebAuthn
  const userID = isoUint8Array.fromUTF8String(user._id.toString());

  // Kasih tau browser daftar perangkat yang udah ada biar gak duplikat
  // HANYA jika allowExisting bernilai false (default)
  const excludeCredentials = allowExisting ? [] : (user.webauthnCredentials || []).map((cred) => ({
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
    attestationType: 'none', 
    excludeCredentials,
    authenticatorSelection: {
      userVerification: 'preferred', 
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257], 
  });
};

// 2. Verifikasi hasil registrasi dari perangkat
export const verifyRegistration = async (body, expectedChallenge, user) => {
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registrasi ditolak perangkat');
  }

  const { credential } = verification.registrationInfo;

  // Ubah public key jadi Base64 biar bisa disimpen di MongoDB
  const credentialPublicKeyString = Buffer.from(credential.publicKey).toString('base64');
  
  const deviceType = body.response?.authenticatorAttachment || body.authenticatorAttachment || 'cross-platform';

  return {
    credentialID: credential.id, 
    credentialPublicKey: credentialPublicKeyString,
    counter: credential.counter || 0,
    deviceType,
    transports: credential.transports || [],
  };
};

// 3. Minta opsi login (authentication)
export const getAuthenticationOptions = async (user) => {
  const allowCredentials = (user.webauthnCredentials || []).map((cred) => ({
    id: cred.credentialID,
    type: 'public-key',
    transports: cred.transports || [],
  }));

  return generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    allowCredentials,
    userVerification: 'preferred',
  });
};

// 4. Verifikasi tanda tangan digital waktu login
export const verifyAuthentication = async (body, expectedChallenge, user, credential) => {
  if (!credential?.credentialID || !credential?.credentialPublicKey) {
    throw new Error('Data alat tidak lengkap di DB');
  }

  // Balikin format Base64 ke biner asli buat pengecekan kriptografi
  const publicKeyBytes = new Uint8Array(Buffer.from(credential.credentialPublicKey, 'base64'));

  const webauthnCredential = {
    id: credential.credentialID,
    publicKey: publicKeyBytes,
    counter: Number(credential.counter) || 0,
    transports: credential.transports || [],
  };

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: webauthnCredential,
    requireUserVerification: false,
  });

  if (!verification.verified) {
    throw new Error('Login gagal, tanda tangan tidak sah');
  }

  // Update counter buat cegah Replay Attack
  return {
    verified: true,
    newCounter: verification.authenticationInfo?.newCounter || webauthnCredential.counter + 1,
  };
};
