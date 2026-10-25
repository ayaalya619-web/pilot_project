const prisma = require('../config/prisma');

class UserService {
    async createUser(validUserData) {
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

module.exports = new UserService();
