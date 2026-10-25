const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_jwt_tokens';

const authGuard = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: "Access Denied: No token provided."
        });
    }

    const token = authHeader.split(' ');

    try {
        const verified = jwt.verify(token[1], JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: "Invalid or expired token."
        });
    }
};

module.exports = authGuard;
