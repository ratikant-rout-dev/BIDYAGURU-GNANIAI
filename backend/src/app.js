const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const careerRoutes = require('./routes/careerRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const progressRoutes = require('./routes/progressRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration for desktop frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bidya Guru API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 routes as per TRD
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', userRoutes); // Provides /api/v1/me
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/v1/voice', voiceRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/v1/resume', resumeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;

