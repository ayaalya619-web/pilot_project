import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { blacklistToken } from '../utils/redis.util.js';
import { RegisterInput, LoginInput } from '../dtos/auth.dto.js';
import axios from 'axios';

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

interface CustomError extends Error {
    statusCode?: number;
}

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';

class AuthService {
    generateTokens(user: { id: string | number; email: string }): TokenResponse {
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET || 'super_secret_access_key',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            const error: CustomError = new Error("Validation Failed: Email already exists.");
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword
            }
        });

        const { accessToken, refreshToken } = this.generateTokens(newUser);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        try {
        
            await axios.post(`${N8N_URL}/webhook-test/register-success`, {
                username: newUser.username,
                email: newUser.email
            });
            console.log(`Successfully triggered n8n workflow for user: ${newUser.email}`);
        } catch (n8nError) {
        
            console.error('Failed to send webhook to n8n:', n8nError);
        }
        
        return { user: newUser, accessToken, refreshToken };
    }

    async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            const error: CustomError = new Error("Validation Failed: Invalid email or password.");
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            const error: CustomError = new Error("Validation Failed: Invalid email or password.");
            error.statusCode = 401;
            throw error;
        }

        const { accessToken, refreshToken } = this.generateTokens(user);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return { user, accessToken, refreshToken };
    }

    async refreshTokens(token: string) {
        if (!token) {
            const error: CustomError = new Error('Refresh token is required');
            error.statusCode = 400;
            throw error;
        }

        const savedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!savedToken || savedToken.expiresAt < new Date()) {
            const error: CustomError = new Error('Invalid or expired refresh token');
            error.statusCode = 401;
            throw error;
        }

        try {
            jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key');
        } catch (err) {
            const error: CustomError = new Error('Invalid refresh token');
            error.statusCode = 401;
            throw error;
        }

        const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(savedToken.user);

        await prisma.$transaction([
            prisma.refreshToken.deleteMany({
                where: { 
                    token: token,
                    createdAt: { lt: new Date(Date.now() - 10000) }
                }
            }),
            prisma.refreshToken.deleteMany({
                where: { token }
            }),
            prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: savedToken.user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);

        return { accessToken, refreshToken: newRefreshToken };
    }

    async logout(accessToken: string, refreshToken: string | undefined, expireSeconds: number) {
        await blacklistToken(accessToken, expireSeconds);

        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken }
            });
        }
    }
}

export default new AuthService();
