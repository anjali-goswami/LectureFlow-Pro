import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { initializeDatabase, isDbConnected } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  const connected = isDbConnected();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgresConnected: connected,
    database: connected ? 'PostgreSQL' : 'In-memory',
    message: connected
      ? 'Connected to PostgreSQL database'
      : 'Running with the in-memory fallback store'
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Initialize before accepting requests to avoid racing schema migration.
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 LectureFlow API live on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
  });
};

startServer();

export default app;
