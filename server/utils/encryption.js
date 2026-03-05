// import module crypto untuk proses enkripsi dan dekripsi
import crypto from 'crypto';

// import dotenv untuk membaca file .env
import dotenv from 'dotenv';
dotenv.config();

// mengambil kunci enkripsi dari environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes_long';

// panjang IV (Initialization Vector)
const IV_LENGTH = 16;

/**
 * fungsi untuk mengenkripsi teks
 * @param {string} text
 * @returns {string}
 */
export const encrypt = (text) => {
  // jika tidak ada teks
  if (!text) return text;

  // membuat key dari ENCRYPTION_KEY
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

  // membuat IV acak
  const iv = crypto.randomBytes(IV_LENGTH);

  // membuat cipher AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  // proses enkripsi
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // gabungkan iv dan hasil enkripsi
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * fungsi untuk mendekripsi teks
 * @param {string} text
 * @returns {string}
 */
export const decrypt = (text) => {
  // jika tidak ada teks
  if (!text) return text;

  try {
    // pisahkan iv dan teks terenkripsi
    const textParts = text.split(':');

    // jika format tidak valid
    if (textParts.length !== 2) return text;

    // ambil iv
    const iv = Buffer.from(textParts[0], 'hex');

    // ambil teks terenkripsi
    const encryptedText = Buffer.from(textParts[1], 'hex');

    // buat key dari ENCRYPTION_KEY
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

    // membuat decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

    // proses dekripsi
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // kembalikan teks asli
    return decrypted.toString();
  } catch (error) {
    // jika terjadi error saat dekripsi
    console.error('Kesalahan dekripsi:', error);

    // kembalikan teks asli
    return text;
  }
};