require('dotenv').config();
const app = require('./src/app');
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🎓 Bidya Guru Backend API is running on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = () => {
      console.log('Shutting down Bidya Guru server gracefully...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

