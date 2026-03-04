import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes_long'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string
 * @param {string} text - text to encrypt
 * @returns {string} - encrypted string with IV
 */
export const encrypt = (text) => {
  if (!text) return text;
  
  // Create a 32-byte key from the secret (pad or truncate as needed)
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypts an encrypted text string
 * @param {string} text - encrypted string with IV
 * @returns {string} - decrypted text
 */
export const decrypt = (text) => {
  if (!text) return text;
  
  try {
    const textParts = text.split(':');
    // If not our format, return as is (might be unencrypted legacy data)
    if (textParts.length !== 2) return text;
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return text; // Fallback to original if decryption fails (e.g. key change or corrupt data)
  }
};
