import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Import routes - COMMENTED OUT FOR TESTING
console.log('🧪 STEP 2: Testing with NO route imports');
// import authRoutes from './routes/auth';
// import projectRoutes from './routes/projects';
// import taskRoutes from './routes/tasks';
// import rumRoutes from './routes/rum';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - COMMENTED OUT FOR TESTING
console.log('🧪 STEP 3: Testing with NO rate limiters');
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Special rate limit for RUM collection (more lenient)
const rumLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // Allow more RUM events
  skip: () => false // Don't skip any requests
});
app.use('/api/rum/', rumLimiter);
*/

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes - ALL COMMENTED OUT FOR TESTING
console.log('🧪 STEP 1: Testing with NO routes');
// app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/rum', rumRoutes);

// Health check - TESTING THIS FIRST
console.log('🧪 STEP 7A: Testing health check route');
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'TaskFlow API is running - TESTING HEALTH CHECK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler - TESTING THIS NOW
console.log('🧪 STEP 7B: Testing 404 handler');
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`
  });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Start server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 STEP 1: If you see this message, the server works WITHOUT routes`);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close().then(() => {
    process.exit(0);
  });
});

// Start the application - DB CONNECTION DISABLED FOR TESTING
console.log('🧪 STEP 6: Testing without database connection');
// connectDB();

// Start server directly for testing
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - NO DATABASE`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧪 STEP 6: If you see this, the path-to-regexp error is FIXED!`);
});

export default app;