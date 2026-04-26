require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { securityHeaders, globalLimiter } = require('./middleware/security');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Allowed Origins ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://iset-restaurant.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

// ─── Global Middleware ────────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ISET Zaghouan Restaurant API', timestamp: new Date().toISOString() });
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reservations', reservationsRoutes);

// ─── Ramadan Status Endpoint ──────────────────────────────────────────────────
app.get('/api/ramadan', (req, res) => {
  // Real Ramadan detection: update dates each year
  const now = new Date();
  const year = now.getFullYear();
  // Example: Ramadan 2025 = Mar 1 – Mar 30; update each year
  const ramadanStart = new Date(`${year}-03-01`);
  const ramadanEnd = new Date(`${year}-03-30`);
  const isRamadan = now >= ramadanStart && now <= ramadanEnd;
  res.json({ isRamadan, year });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable', path: req.path });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
