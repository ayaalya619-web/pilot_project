import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../utils/redis.util.js';
const authGuard = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Unauthorized: No token provided.');
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(' ')[1];
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            const error = new Error('Unauthorized: Token has been revoked (logged out).');
            error.statusCode = 401;
            throw error;
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_secret_access_key');
        req.user = decoded;
        req.token = token;
        next();
    }
    catch (error) {
        const customError = error;
        if (customError.name === 'TokenExpiredError') {
            customError.message = 'TokenExpired';
            customError.statusCode = 401;
        }
        next(customError);
    }
};
export default authGuard;
