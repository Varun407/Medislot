const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { FRONTEND_ORIGIN, NODE_ENV } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// 1. Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Allows cross-origin API usage with frontend dev server
    crossOriginEmbedderPolicy: false
}));

// 2. CORS Configuration
const allowedOrigins = [
    FRONTEND_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (
            FRONTEND_ORIGIN === '*' ||
            allowedOrigins.indexOf(origin) !== -1 ||
            NODE_ENV === 'development' ||
            origin.endsWith('.vercel.app')
        ) {
            return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Body Parsing & Cookies with Size Limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 4. API Root & Health Check
app.get('/', (req, res) => {
    res.json({
        service: 'Medislot Healthcare Backend API',
        version: '2.0.0',
        status: 'ONLINE',
        healthCheck: '/api/health',
        apiBase: '/api/v1',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Medislot Healthcare API v2.0'
    });
});

// 5. Versioned API Routes (/api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);

// 6. Legacy / Convenience Aliases for existing contracts
app.use('/api/hospitals', (req, res, next) => { req.url = '/hospitals' + req.url; publicRoutes(req, res, next); });
app.use('/api/departments', (req, res, next) => { req.url = '/departments' + req.url; publicRoutes(req, res, next); });
app.use('/api/doctors', (req, res, next) => { req.url = '/doctors' + req.url; publicRoutes(req, res, next); });
app.use('/api/stats', (req, res, next) => { req.url = '/stats' + req.url; publicRoutes(req, res, next); });
app.use('/api/grievances', (req, res, next) => { req.url = '/grievances' + req.url; publicRoutes(req, res, next); });

// 7. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
