// ENTRY POINT: File ini adalah titik awal (entry point) untuk menjalankan server Node.js
import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
});

// FUNGSI: Menutup server secara aman (graceful shutdown) saat menerima sinyal kill (seperti Ctrl+C)
// Memastikan koneksi database diputus dengan benar sebelum proses Node.js berhenti
const gracefulShutdown = (signal) => {

  server.close(() => {

    mongoose.connection
      .close(false)
      .then(() => {

        process.exit(0);
      })
      .catch((err) => {
        console.error('Error closing Mongo connection:', err);
        process.exit(1);
      });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
