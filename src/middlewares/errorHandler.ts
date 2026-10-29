import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

interface CustomError extends Error {
    statusCode?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    let statusCode: number = err.statusCode || 500;
    let message: string = err.message || "Internal Server Error";

    if (typeof message === 'string' && (message.startsWith('[') || message.startsWith('{'))) {
        try {
            const parsed = JSON.parse(message);
            if (Array.isArray(parsed) && parsed[0]?.message) {
                message = parsed.map((e: any) => e.message).join(', ');
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

export default errorHandler;
