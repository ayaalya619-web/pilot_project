import prisma from '../config/prisma.js';
import { CreateUserInput } from '../dtos/user.dto.js';

class UserService {
    async createUser(validUserData: CreateUserInput) {
        const emailExists = await prisma.user.findUnique({
            where: { email: validUserData.email }
        });
        
        if (emailExists) {
            throw new Error("Conflict: Email is already registered.");
        }

        const newUser = await prisma.user.create({
            data: {
                username: validUserData.username,
                email: validUserData.email,
                password: validUserData.password
            }
        });

        return newUser;
    }

    async getAllUsers() {
        return await prisma.user.findMany();
    }
}

export default new UserService();
