require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const redis = require('redis');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./api/auth/auth.routes');
const userRoutes = require('./api/user/user.routes');
const paymentRoutes = require('./api/payment/payment.routes');
const routerRoutes = require('./api/router/router.routes');

// Import middleware
const errorHandler = require('./api/middleware/errorHandler');
const logger = require('./api/utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => logger.info('✅ MongoDB connected successfully'))
.catch((err) => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ============================================
// REDIS CONNECTION
// ============================================

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('connect', () => logger.info('✅ Redis connected successfully'));
redisClient.on('error', (err) => logger.error('❌ Redis error:', err));

redisClient.connect().catch(console.error);

// Make redis client available globally
app.locals.redis = redisClient;

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'LAN Connect API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/payment`, paymentRoutes);
app.use(`/api/${API_VERSION}/router`, routerRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📡 API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            redisClient.quit(() => {
                logger.info('Redis connection closed');
                process.exit(0);
            });
        });
    });
});

module.exports = app;
