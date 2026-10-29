import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient, isTokenBlacklisted } from '../utils/redis.util.js';
import jwt from 'jsonwebtoken';
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(redisClient, subClient));
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token || typeof token !== 'string') {
                return next(new Error('Authentication error: Token missing'));
            }
            const isBlacklisted = await isTokenBlacklisted(token);
            if (isBlacklisted) {
                return next(new Error('Authentication error: Token is blacklisted'));
            }
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_secret_access_key');
            socket.user = decoded;
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.user?.id;
        console.log(`🔔 User listening for notifications: ${userId} (Socket: ${socket.id})`);
        if (userId) {
            socket.join(`user_room:${userId}`);
        }
        socket.on('disconnect', () => {
            console.log(`🔕 User stopped listening for notifications: ${socket.id}`);
        });
    });
    return io;
};
export const sendNotificationToUser = (userId, notificationData) => {
    if (!io) {
        throw new Error('Socket.io has not been initialized!');
    }
    io.to(`user_room:${userId}`).emit('message', {
        title: notificationData.title,
        message: notificationData.message,
        payload: notificationData.payload || {},
        createdAt: new Date()
    });
};
export const broadcastNotification = (notificationData) => {
    if (!io) {
        throw new Error('Socket.io has not been initialized!');
    }
    io.emit('message', {
        title: notificationData.title,
        message: notificationData.message,
        payload: notificationData.payload || {},
        createdAt: new Date()
    });
};
