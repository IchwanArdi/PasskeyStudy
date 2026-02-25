import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import statsRoutes from './routes/stats.js';
import securityRoutes from './routes/security.js';
import uxRoutes from './routes/ux.js';
import costRoutes from './routes/cost.js';
import compatibilityRoutes from './routes/compatibility.js';
import recoveryRoutes from './routes/recovery.js';
import performanceRoutes from './routes/performance.js';
import rateLimit from 'express-rate-limit';

// Create Express app
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB (async, but we don't await to allow server to start)
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// CORS must be configured first to handle preflight requests
const rawCorsOrigin = process.env.RP_ORIGIN;
const defaultOrigins = ['http://localhost:5173', 'https://auth-methods.vercel.app'];
const allowedOrigins = Array.isArray(rawCorsOrigin)
  ? rawCorsOrigin
  : typeof rawCorsOrigin === 'string'
  ? rawCorsOrigin
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : defaultOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin (no origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Log for debugging
    console.warn(`CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Performance measurement middleware
import performanceMiddleware from './middleware/performanceMiddleware.js';
app.use(performanceMiddleware);

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

// Session setup (single-admin auth)
const sessionSecret = process.env.SESSION_SECRET || 'change_this_secret';
const isProduction = (process.env.NODE_ENV || 'development') === 'production';

app.use(
  session({
    name: 'sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // true jika HTTPS
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 jam
    },
  })
);

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebAuthn Passwordless Demo API',
    timestamp: new Date().toISOString(),
  });
});
// Rate limiting (hanya aktif di production)
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
  app.use('/auth', authLimiter);
}

// Routes - support both /api/* and /* for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Alias for client compatibility
app.use('/api/user', userRoutes);
app.use('/user', userRoutes); // Alias for client compatibility
app.use('/api/stats', statsRoutes);
app.use('/stats', statsRoutes); // Alias for client compatibility
app.use('/api/security', securityRoutes);
app.use('/security', securityRoutes); // Alias for client compatibility
app.use('/api/ux', uxRoutes);
app.use('/ux', uxRoutes); // Alias for client compatibility
app.use('/api/cost', costRoutes);
app.use('/cost', costRoutes); // Alias for client compatibility
app.use('/api/compatibility', compatibilityRoutes);
app.use('/compatibility', compatibilityRoutes); // Alias for client compatibility
app.use('/api/recovery', recoveryRoutes);
app.use('/recovery', recoveryRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/performance', performanceRoutes);

// Export app for use in server.js
export default app;
