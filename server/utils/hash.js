import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Kunci untuk hashing yang konsisten (Blind Index)
const HASH_SECRET = process.env.HASH_SECRET || 'secret_untuk_blind_index_pencarian_nik';

/**
 * Membuat hash satu-arah yang konsisten dari sebuah string
 * Digunakan untuk Blind Index agar data yang dienkripsi tetap bisa dicari
 * tanpa harus mendekripsi seluruh database
 */
export const createHash = (text) => {
  if (!text) return text;
  
  // Gunakan HMAC SHA-256 untuk hash yang aman tapi konsisten
  // Selalu lowercase dan trim sebelum dihash agar pencarian email tidak case-sensitive
  const normalizedText = text.toLowerCase().trim();
  
  return crypto.createHmac('sha256', String(HASH_SECRET))
    .update(normalizedText)
    .digest('hex');
};
