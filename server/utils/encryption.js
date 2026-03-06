// AES-256-CBC buat enkripsi data sensitif (NIK, Nama, dll) biar aman di DB
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Ambil secret key dari .env (harus 32 karakter/bytes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'kunci_rahasia_minimal_32_karakter';
const IV_LENGTH = 16; 

// Fungsi buat ngubah teks biasa jadi kode acak (enkripsi)
export const encrypt = (text) => {
  if (!text) return text;

  // Hash key biar panjangnya pas 32 byte buat AES-256
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

  // Bikin IV acak biar hasil enkripsi gak selalu sama
  const iv = crypto.randomBytes(IV_LENGTH);

  // Setup cipher algoritma AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Gabungin IV sama hasil enkripsi pake pemisah ':' buat disimpen di DB
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Fungsi buat balikin kode acak jadi teks asli (dekripsi)
export const decrypt = (text) => {
  if (!text) return text;

  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text;

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

    // Setup pemecah kode (decipher) pake key & IV yang sama
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    // Log error yang lebih informatif untuk debugging (misal: kunci .env salah)
    if (process.env.ENCRYPTION_KEY === 'kunci_rahasia_minimal_32_karakter' || !process.env.ENCRYPTION_KEY) {
      console.error('CRITICAL: ENCRYPTION_KEY belum diatur di .env atau masih pakai default!');
    } else {
      console.error('Gagal dekripsi (Bad Decrypt): Kunci di .env mungkin beda dengan kunci saat data dibuat.', error.message);
    }
    return text;
  }
};