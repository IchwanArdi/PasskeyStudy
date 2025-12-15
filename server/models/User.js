import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  createdAt: {
    type: Date,
    default: Date.now,
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
  webauthnCredentials: [webauthnCredentialSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
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

const User = mongoose.model('User', userSchema);

export default User;
