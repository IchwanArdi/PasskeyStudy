import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';

const rpName = process.env.RP_NAME || 'WebAuthn Passwordless Demo';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5173';

export const getRegistrationOptions = async (user) => {
  try {
    // Ensure user has required fields
    if (!user._id) {
      throw new Error('User ID is required');
    }
    if (!user.email) {
      throw new Error('User email is required');
    }
    if (!user.username) {
      throw new Error('User username is required');
    }

    // Convert user ID to Uint8Array
    const userID = isoUint8Array.fromUTF8String(user._id.toString());

    // Prepare exclude credentials (if any)
    const excludeCredentials = (user.webauthnCredentials || []).map((cred) => {
      // credentialID should be a base64url string
      const excludeDescriptor = {
        id: cred.credentialID,
        type: 'public-key',
      };

      // Only include transports for cross-platform authenticators that have transports saved
      // Platform authenticators should not have transports specified
      if (cred.deviceType === 'cross-platform' && cred.transports && Array.isArray(cred.transports) && cred.transports.length > 0) {
        excludeDescriptor.transports = cred.transports;
      }
      // For platform authenticators or if no transports saved, omit transports field

      return excludeDescriptor;
    });

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID,
      userName: user.email,
      userDisplayName: user.username || user.email.split('@')[0],
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        // Allow both platform (Windows Hello, Touch ID) and cross-platform (USB keys)
        // Remove authenticatorAttachment restriction to allow all types
        userVerification: 'preferred', // preferred instead of required for flexibility
        requireResidentKey: false,
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    return options;
  } catch (error) {
    console.error('Error generating registration options:', error);
    throw error;
  }
};

export const verifyRegistration = async (body, expectedChallenge, user) => {
  try {
    // Get origin from response if available, otherwise use configured origin
    const responseOrigin = body.response?.clientExtensionResults?.appid || body.response?.clientExtensionResults?.credProps?.rk ? origin : origin;


    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false, // Set to false to be more flexible
    });


    if (!verification.verified) {
      throw new Error('Verification failed: not verified');
    }

    if (!verification.registrationInfo) {
      throw new Error('Verification failed: no registration info');
    }

    // Get credentialID from body (it's always there in base64url format)
    let credentialID = body.id || body.rawId;

    // Get credentialPublicKey from registrationInfo.credential (newer structure)
    // or from registrationInfo.credentialPublicKey (older structure)
    let credentialPublicKey;
    let counter = 0;

    if (verification.registrationInfo.credential) {
      // Newer structure: credential is an object with publicKey
      credentialPublicKey = verification.registrationInfo.credential.publicKey;
      counter = verification.registrationInfo.credential.counter || 0;
    } else if (verification.registrationInfo.credentialPublicKey) {
      credentialPublicKey = verification.registrationInfo.credentialPublicKey;
      counter = verification.registrationInfo.counter || 0;
    } else {
      throw new Error('credentialPublicKey not found in registrationInfo');
    }

    if (!credentialID) {
      throw new Error('Verification failed: credentialID is missing from registration info and response body');
    }

    // credentialID from body is already a base64url string, use as is
    // If it's rawId (Uint8Array), convert it
    let credentialIDString;
    try {
      if (typeof credentialID === 'string') {
        // Already a base64url string from body.id
        credentialIDString = credentialID;
      } else if (credentialID instanceof Uint8Array || credentialID instanceof ArrayBuffer) {
        // Convert Uint8Array/ArrayBuffer to base64url (from body.rawId)
        credentialIDString = Buffer.from(credentialID).toString('base64url');
      } else if (credentialID instanceof Buffer) {
        credentialIDString = credentialID.toString('base64url');
      } else {
        throw new Error(`Unexpected credentialID type: ${typeof credentialID}`);
      }
    } catch (error) {
      console.error('Error converting credentialID:', error);
      console.error('credentialID value:', credentialID);
      console.error('credentialID type:', typeof credentialID);
      throw new Error(`Failed to convert credentialID: ${error.message}`);
    }

    // Convert credentialPublicKey to base64 string
    let credentialPublicKeyString;
    try {
      if (credentialPublicKey instanceof Buffer) {
        credentialPublicKeyString = credentialPublicKey.toString('base64');
      } else if (credentialPublicKey instanceof Uint8Array) {
        credentialPublicKeyString = Buffer.from(credentialPublicKey).toString('base64');
      } else if (typeof credentialPublicKey === 'string') {
        // Already a string, use as is
        credentialPublicKeyString = credentialPublicKey;
      } else {
        throw new Error(`Unexpected credentialPublicKey type: ${typeof credentialPublicKey}`);
      }
    } catch (error) {
      console.error('Error converting credentialPublicKey:', error);
      console.error('credentialPublicKey type:', typeof credentialPublicKey);
      throw new Error(`Failed to convert credentialPublicKey: ${error.message}`);
    }

    // Ensure counter is a number (default to 0 if not provided)
    const finalCounter = typeof counter === 'number' ? counter : 0;

    const deviceType = body.response?.authenticatorAttachment || body.authenticatorAttachment || 'cross-platform';

    // Extract transports from response if available
    // For platform authenticators (built-in like fingerprint/face ID), we don't store transports
    // because they can be used on other devices with platform authenticators
    // For cross-platform authenticators (USB keys), we store transports to help browser identify them
    let transports = [];
    if (deviceType === 'cross-platform') {
      // Only store transports for cross-platform authenticators
      if (verification.registrationInfo?.transports && Array.isArray(verification.registrationInfo.transports)) {
        transports = verification.registrationInfo.transports;
      } else if (body.response?.transports && Array.isArray(body.response.transports)) {
        transports = body.response.transports;
      } else if (body.transports && Array.isArray(body.transports)) {
        transports = body.transports;
      }
    }
    // For platform authenticators, leave transports empty so browser can use any platform authenticator

    return {
      credentialID: credentialIDString,
      credentialPublicKey: credentialPublicKeyString,
      counter: finalCounter,
      deviceType,
      transports,
    };
  } catch (error) {
    console.error('Error in verifyRegistration:', error.message);
    throw new Error(`Registration verification failed: ${error.message}`);
  }
};

export const getAuthenticationOptions = async (user) => {
  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    allowCredentials:
      user.webauthnCredentials?.map((cred) => {
        // For platform authenticators, don't specify transports
        // This allows the credential to be used with any platform authenticator
        // (e.g., credential created on phone can be used with Windows Hello on laptop)
        // For cross-platform authenticators, use stored transports if available
        const credentialDescriptor = {
          id: cred.credentialID, // credentialID is already stored as base64url string
          type: 'public-key',
        };

        // Only include transports for cross-platform authenticators that have transports saved
        // Platform authenticators should not have transports specified to allow cross-device use
        if (cred.deviceType === 'cross-platform' && cred.transports && Array.isArray(cred.transports) && cred.transports.length > 0) {
          credentialDescriptor.transports = cred.transports;
        }
        // For platform authenticators or if no transports saved, omit transports field
        // This allows browser to use any compatible authenticator

        return credentialDescriptor;
      }) || [],
    userVerification: 'preferred',
  });

  return options;
};

export const verifyAuthentication = async (body, expectedChallenge, user, credential) => {
  try {
    // Validate credential parameter
    if (!credential) {
      throw new Error('Credential parameter is required');
    }

    if (!credential.credentialID) {
      throw new Error('Credential ID is missing');
    }

    if (!credential.credentialPublicKey) {
      throw new Error('Credential public key is missing');
    }

    // Ensure counter exists and is a number
    const initialCounter = credential.counter !== undefined && credential.counter !== null ? Number(credential.counter) : 0;


    // credentialID is stored as base64url string, convert to Uint8Array using helper
    let credentialIDBuffer;
    try {
      if (typeof credential.credentialID === 'string') {
        // Use helper function from library if available, otherwise use Buffer
        if (isoBase64URL && typeof isoBase64URL.toBuffer === 'function') {
          credentialIDBuffer = isoBase64URL.toBuffer(credential.credentialID);
        } else {
          // Fallback: use Buffer with base64url encoding
          credentialIDBuffer = new Uint8Array(Buffer.from(credential.credentialID, 'base64url'));
        }
      } else if (credential.credentialID instanceof Uint8Array) {
        credentialIDBuffer = credential.credentialID;
      } else if (credential.credentialID instanceof Buffer) {
        credentialIDBuffer = new Uint8Array(credential.credentialID);
      } else {
        throw new Error(`Unexpected credentialID type: ${typeof credential.credentialID}`);
      }
    } catch (error) {
      console.error('Error converting credentialID:', error);
      throw new Error(`Failed to convert credentialID: ${error.message}`);
    }

    // Convert credentialPublicKey from base64 string to Uint8Array
    let credentialPublicKeyBuffer;
    try {
      if (typeof credential.credentialPublicKey === 'string') {
        // credentialPublicKey is stored as base64 string, convert to Uint8Array
        const base64Buffer = Buffer.from(credential.credentialPublicKey, 'base64');
        credentialPublicKeyBuffer = new Uint8Array(base64Buffer);
      } else if (credential.credentialPublicKey instanceof Buffer) {
        credentialPublicKeyBuffer = new Uint8Array(credential.credentialPublicKey);
      } else if (credential.credentialPublicKey instanceof Uint8Array) {
        credentialPublicKeyBuffer = credential.credentialPublicKey;
      } else {
        throw new Error(`Unexpected credentialPublicKey type: ${typeof credential.credentialPublicKey}`);
      }
    } catch (error) {
      console.error('Error converting credentialPublicKey:', error);
      throw new Error(`Failed to convert credentialPublicKey: ${error.message}`);
    }

    // Use the initial counter we validated earlier
    const credentialCounter = initialCounter;


    // Prepare credential object with correct structure for @simplewebauthn/server v11+
    // Library expects: { id: Uint8Array, publicKey: Uint8Array, counter: number, transports?: string[] }
    const webauthnCredential = {
      id: credentialIDBuffer,
      publicKey: credentialPublicKeyBuffer,
      counter: credentialCounter,
      // transports is optional, can be added if available
    };


    // Validate credential object before passing to library
    if (!webauthnCredential.id || !webauthnCredential.publicKey) {
      throw new Error('Invalid credential: missing id or publicKey');
    }

    if (typeof webauthnCredential.counter !== 'number') {
      throw new Error(`Invalid credential: counter must be a number, got ${typeof webauthnCredential.counter}`);
    }


    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: webauthnCredential, // Changed from 'authenticator' to 'credential' for v11+
        requireUserVerification: false, // Set to false for flexibility
      });
    } catch (libError) {
      console.error('Library error in verifyAuthenticationResponse:', {
        name: libError.name,
        message: libError.message,
        stack: libError.stack,
        errorKeys: Object.keys(libError),
      });

      // Log the exact credential object that was passed
      console.error('Credential object that caused error:', {
        id: webauthnCredential.id instanceof Uint8Array ? `Uint8Array(${webauthnCredential.id.length})` : typeof webauthnCredential.id,
        publicKey: webauthnCredential.publicKey instanceof Uint8Array ? `Uint8Array(${webauthnCredential.publicKey.length})` : typeof webauthnCredential.publicKey,
        counter: webauthnCredential.counter,
        counterType: typeof webauthnCredential.counter,
      });

      throw libError;
    }

    if (verification.verified) {
      return {
        verified: true,
        newCounter: verification.authenticationInfo?.newCounter || webauthnCredential.counter + 1,
      };
    }

    throw new Error('Authentication verification failed');
  } catch (error) {
    console.error('Error verifying authentication:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
