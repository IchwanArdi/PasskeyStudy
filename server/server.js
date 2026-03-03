import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[LOCAL] URL: http://localhost:${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed. Closing Mongo connection...');
    mongoose.connection
      .close(false)
      .then(() => {
        console.log('Mongo connection closed. Exiting.');
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
