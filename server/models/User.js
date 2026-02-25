import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const webauthnCredentialSchema = new mongoose.Schema({
  credentialID: {
    type: String,
    required: true,
    // Remove unique from subdocument - we'll handle uniqueness at application level
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
    enum: ['platform', 'cross-platform'],
  },
  transports: {
    type: [String],
    default: [],
  },
  nickname: {
    type: String,
    default: 'My Authenticator',
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
      message: 'Username must be between 3 and 30 characters',
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
  authMethod: {
    type: String,
    enum: ['webauthn', 'password', 'hybrid'],
    default: 'webauthn',
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
  securityReputation: {
    type: Number,
    default: 100,
  },
  knownDevices: [
    {
      userAgent: String,
      lastUsed: Date,
    },
  ],
  backupCodes: [
    {
      code: String,
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    // Only hash password if it's modified and exists
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Update timestamp
    if (this.isNew || this.isModified()) {
      this.updatedAt = Date.now();
    }

    // Ensure next is a function before calling
    if (typeof next === 'function') {
      next();
    }
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    if (typeof next === 'function') {
      next(error);
    } else {
      throw error;
    }
  }
});

// Note: We allow users to be created without password for WebAuthn flow
// The credential will be added in the next step, so validation happens at application level

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add WebAuthn credential
userSchema.methods.addWebAuthnCredential = async function (credential) {
  // Check if credentialID already exists for this user
  const existingCred = this.webauthnCredentials.find((cred) => cred.credentialID === credential.credentialID);

  if (existingCred) {
    throw new Error('This credential is already registered for this user');
  }

  this.webauthnCredentials.push(credential);
  return this.save();
};

// Method to find credential by ID
userSchema.methods.findCredential = function (credentialID) {
  return this.webauthnCredentials.find((cred) => cred.credentialID === credentialID);
};

// Method to update credential counter
userSchema.methods.updateCredentialCounter = function (credentialID, counter) {
  const credential = this.findCredential(credentialID);
  if (credential) {
    credential.counter = counter;
    return this.save();
  }
  return null;
};

// Method to remove a WebAuthn credential
userSchema.methods.removeWebAuthnCredential = async function (credentialID) {
  const index = this.webauthnCredentials.findIndex(
    (cred) => cred.credentialID === credentialID
  );

  if (index === -1) {
    throw new Error('Credential tidak ditemukan');
  }

  // Prevent deleting last credential for WebAuthn-only users
  if (!this.password && this.webauthnCredentials.length <= 1) {
    throw new Error(
      'Tidak dapat menghapus credential terakhir. Tambahkan perangkat lain terlebih dahulu.'
    );
  }

  this.webauthnCredentials.splice(index, 1);
  return this.save();
};

// Method to generate recovery codes
userSchema.methods.generateRecoveryCodes = async function () {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }

  this.backupCodes = codes.map((code) => ({
    code: crypto.createHash('sha256').update(code).digest('hex'),
    used: false,
    createdAt: new Date(),
  }));

  await this.save();
  return codes; // Return plain codes (only shown once)
};

// Method to verify and use a recovery code
userSchema.methods.useRecoveryCode = async function (plainCode) {
  const hashed = crypto.createHash('sha256').update(plainCode.toUpperCase().trim()).digest('hex');

  const codeEntry = this.backupCodes.find((c) => c.code === hashed && !c.used);
  if (!codeEntry) return false;

  codeEntry.used = true;
  await this.save();
  return true;
};

const User = mongoose.model('User', userSchema);

export default User;

