// APP CONFIGURATION: Pengaturan framework Express, middleware, dan routing
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import recoveryRoutes from './routes/recovery.js';
import pengajuanRoutes from './routes/pengajuan.js';
import rateLimit from 'express-rate-limit';

// Inisialisasi instance framework Express
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// KEAMANAN: Konfigurasi CORS (Cross-Origin Resource Sharing)
// Membatasi domain apa saja (contoh: domain frontend localhost/vercel) yang diizinkan mengakses API ini.
const allowedOrigins = (process.env.RP_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Middleware untuk memparsing body pada HTTP request yang berformat JSON
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Compression
app.use(compression());

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.set('trust proxy', 1); // penting di Railway / Vercel

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebAuthn Passwordless Demo API',
    timestamp: new Date().toISOString(),
  });
});

// Handle favicon requests to avoid 404 errors in logs
app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());

// Rate limiting (hanya aktif di production)
// KEAMANAN: Rate limiter untuk mencegah serangan DoS (Denial of Service) atau brute-force
if (isProduction) {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 300, // Maks 300 request per IP per window
    message: { message: 'Terlalu banyak request, coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 30, // Maks 30 percobaan auth per IP
    message: { message: 'Terlalu banyak percobaan autentikasi. Silakan coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);
}

// ROUTING: Mendaftarkan semua kumpulan endpoint/API yang tersedia di backend
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/pengajuan', pengajuanRoutes);

// Export app for use in server.js
export default app;
