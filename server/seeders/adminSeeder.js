/**
 * Admin Seeder — Desa Karangpucung
 *
 * Usage: node server/seeders/adminSeeder.js <email>
 * Contoh: node server/seeders/adminSeeder.js admin@desaKarangpucung.id
 *
 * Script ini mengupgrade role user yang sudah terdaftar
 * menjadi 'admin'. User harus sudah register via WebAuthn terlebih dahulu.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('[ERR] MONGO_URI tidak ditemukan di .env');
  process.exit(1);
}

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('[ERR] Email wajib disertakan!');
  console.error('   Usage: node server/seeders/adminSeeder.js <email>');
  process.exit(1);
}

// Inline schema agar tidak ada circular deps
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function makeAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[OK] Terhubung ke MongoDB');

    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase().trim() },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (!user) {
      console.error(`[ERR] User dengan email \"${targetEmail}\" tidak ditemukan.`);
      console.error('   Pastikan user sudah register via WebAuthn terlebih dahulu.');
      process.exit(1);
    }

    console.log(`[OK] Berhasil! User \"${user.username || targetEmail}\" sekarang memiliki role: ADMIN`);
  } catch (err) {
    console.error('[ERR] Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[INFO] Koneksi MongoDB ditutup.');
  }
}

makeAdmin();
