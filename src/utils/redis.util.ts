import { Redis } from 'ioredis';

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null
});

export const blacklistToken = async (token: string, expireSeconds: number): Promise<void> => {
    if (expireSeconds > 0) {
        await redisClient.set(`blacklist:${token}`, 'true', 'EX', Math.ceil(expireSeconds));
    }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === 'true';
};
