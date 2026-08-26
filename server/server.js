import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express Application & HTTP Server
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5050;
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

// 3. Connect to Database
connectDB();

// 4. Initialize Socket.IO Server with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// 5. Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for DDoS & Brute-force protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', globalLimiter);

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-Time Chat Application API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    socketConnections: io.engine.clientsCount,
  });
});

// 7. Base Socket.IO Baseline Listener
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

  socket.on('ping_server', (data) => {
    socket.emit('pong_client', {
      message: 'Server received your ping!',
      timestamp: new Date().toISOString(),
      echo: data,
    });
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

// 8. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// 9. Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 10. Start Server
server.listen(PORT, () => {
  console.log(`
🚀 ==================================================== 🚀
   Real-Time Chat Server running on: http://localhost:${PORT}
   Allowed Origins:                 ${allowedOrigins.join(', ')}
   Environment:                     ${process.env.NODE_ENV || 'development'}
   Socket.IO is ready for real-time bidirectional communication
🚀 ==================================================== 🚀
  `);
});

// Export instances for testing or modular extension
export { app, server, io };
