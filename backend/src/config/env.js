require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://bidyaguru-gnaniai.vercel.app'
      : 'http://localhost:5173'
  ),
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'bidya_guru_default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'bidya_guru_default_refresh_secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },
  gnani: {
    apiKey: process.env.GNANI_API_KEY,
    baseUrl: process.env.GNANI_BASE_URL || 'https://api.vachana.ai'
  },
  jobApi: {
    apiKey: process.env.JOB_API_KEY || 'sk-live-Hp3SutlytQAIPJpFgc6MhtGpc1p1CQ6ETmhi6AHM'
  }
};

module.exports = config;
