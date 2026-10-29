import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../utils/redis.util.js';
const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: async (args) => {
            return await redisClient.call(args[0], ...args.slice(1));
        },
    }),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            status: 429,
            message: 'Too many requests. Please try again after a minute.',
        });
    },
});
export default postLimiter;
