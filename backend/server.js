require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const EapcetCollege = require('./models/EapcetCollege');
const JosaCollege = require('./models/JosaCollege');
const {
  seedEapcet,
  seedJosaa,
  DATASETS_DIR,
  hasDatasetsDirectory,
  listDatasetFiles,
} = require('./scripts/seedData');

const app = express();

function normalizeOrigin(value) {
  if (!value) return null;

  try {
    return new URL(value.trim()).origin;
  } catch (_error) {
    return value.trim().replace(/\/+$/, '');
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const defaultOrigins = isProduction ? [] : ['http://localhost:5173', 'http://localhost:5174'];
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);
const envFrontendUrl = normalizeOrigin(process.env.FRONTEND_URL || process.env.APP_URL || '');
const knownHostedOrigins = ['https://path2campus-1.onrender.com'];
const allowedOrigins = [
  ...new Set([
    ...defaultOrigins.map(normalizeOrigin),
    ...configuredOrigins,
    envFrontendUrl,
    ...knownHostedOrigins.map(normalizeOrigin),
  ].filter(Boolean)),
];

function corsOrigin(origin, callback) {
  // Allow same-origin/server-to-server requests with no Origin header.
  if (!origin) {
    return callback(null, true);
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return callback(null, true);
  }

  console.warn(`CORS blocked for origin: ${normalizedOrigin}`);
  return callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
}

const frontendDistPath =
  process.env.FRONTEND_DIST_PATH || path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild =
  fs.existsSync(frontendDistPath) && fs.existsSync(path.join(frontendDistPath, 'index.html'));

async function ensureSeededData() {
  const [eapcetCount, josaaCount] = await Promise.all([
    EapcetCollege.countDocuments(),
    JosaCollege.countDocuments(),
  ]);

  if (eapcetCount > 0 || josaaCount > 0) {
    return { eapcetCount, josaaCount, seeded: false, reason: 'collections-populated' };
  }

  if (!hasDatasetsDirectory()) {
    console.warn(`Datasets directory not found at ${DATASETS_DIR}`);
    return { eapcetCount, josaaCount, seeded: false, reason: 'datasets-directory-missing' };
  }

  const files = listDatasetFiles();
  if (!files.length) {
    console.warn(`Datasets directory is empty at ${DATASETS_DIR}`);
    return { eapcetCount, josaaCount, seeded: false, reason: 'datasets-directory-empty' };
  }

  console.log(`College collections are empty. Attempting bootstrap seed from ${DATASETS_DIR}`);
  await seedEapcet();
  await seedJosaa();

  const [seededEapcetCount, seededJosaaCount] = await Promise.all([
    EapcetCollege.countDocuments(),
    JosaCollege.countDocuments(),
  ]);

  console.log(
    `Bootstrap seed complete: EAPCET=${seededEapcetCount}, JoSAA=${seededJosaaCount}`
  );

  return {
    eapcetCount: seededEapcetCount,
    josaaCount: seededJosaaCount,
    seeded: true,
    reason: 'bootstrap-seeded',
  };
}

let startupDiagnostics = {
  datasetsDir: DATASETS_DIR,
  datasetsDirExists: hasDatasetsDirectory(),
  datasetFiles: listDatasetFiles(),
  nodeEnv: process.env.NODE_ENV || 'development',
  eapcetCount: 0,
  josaaCount: 0,
  bootstrapSeeded: false,
  bootstrapReason: 'not-started',
  allowedOrigins,
};

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }));
app.options('*', cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/eapcet', require('./routes/eapcet'));
app.use('/api/josaa', require('./routes/josaa'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/location', require('./routes/location'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date(),
    diagnostics: startupDiagnostics,
  })
);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// API 404
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Non-API 404 when no frontend build is being served by Express
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const seedStatus = await ensureSeededData();
  startupDiagnostics = {
    datasetsDir: DATASETS_DIR,
    datasetsDirExists: hasDatasetsDirectory(),
    datasetFiles: listDatasetFiles(),
    nodeEnv: process.env.NODE_ENV || 'development',
    eapcetCount: seedStatus.eapcetCount,
    josaaCount: seedStatus.josaaCount,
    bootstrapSeeded: seedStatus.seeded,
    bootstrapReason: seedStatus.reason,
    allowedOrigins,
  };

  app.listen(PORT, () => console.log(`Path2Campus server running on port ${PORT}`));
}

startServer().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
