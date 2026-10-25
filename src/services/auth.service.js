const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_jwt_tokens';

class AuthService {
    async register(data) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error("Validation Failed: Email already exists.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword
            }
        });

        const token = this.generateToken(newUser.id);
        return { user: newUser, token };
    }

    async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error("Validation Failed: Invalid email or password.");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Validation Failed: Invalid email or password.");
        }

        const token = this.generateToken(user.id);
        return { user, token };
    }

    generateToken(userId) {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
    }
}

module.exports = new AuthService();
