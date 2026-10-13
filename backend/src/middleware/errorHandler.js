const { NODE_ENV } = require('../config/env');

function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

    const statusCode = err.status || err.statusCode || 500;
    const isProduction = NODE_ENV === 'production';

    res.status(statusCode).json({
        error: err.message || 'Internal Server Error. An unexpected error occurred.',
        ...(isProduction ? {} : { stack: err.stack })
    });
}

function notFoundHandler(req, res) {
    res.status(404).json({
        error: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
