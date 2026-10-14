const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://varunvr116_db_user:2ALVP6miXK0b2ziP@cluster0.d9zx0hv.mongodb.net/medislot?retryWrites=true&w=majority&appName=Cluster0',
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_fallback_replace_in_prod_at_least_32_chars',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    ADMIN_DEFAULT_EMAIL: process.env.ADMIN_DEFAULT_EMAIL || 'admin@medislot.gov.in',
    ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSecure@2026',
    ADMIN_DEFAULT_NAME: process.env.ADMIN_DEFAULT_NAME || 'Chief Medical Administrator',
    ADMIN_DEFAULT_PHONE: process.env.ADMIN_DEFAULT_PHONE || '9848099999'
};
