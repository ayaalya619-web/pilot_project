const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (typeof message === 'string' && (message.startsWith('[') || message.startsWith('{'))) {
        try {
            const parsed = JSON.parse(message);
            if (Array.isArray(parsed) && parsed[0]?.message) {
                message = parsed.map(e => e.message).join(', ');
                statusCode = 400;
            }
        } catch (e) {}
    }

    if (statusCode === 500) {
        logger.error(`${req.method} ${req.originalUrl} - ${message}`, err);
    } else {
        logger.warn(`${req.method} ${req.originalUrl} - Status: ${statusCode} - ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
