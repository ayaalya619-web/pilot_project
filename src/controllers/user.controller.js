const userService = require('../services/user.service');
const UserDTO = require('../dtos/user.dto');

class UserController {
    async createUser(req, res, next) {
        try {
            const validatedData = UserDTO.validateCreateInput(req.body);
            const createdUser = await userService.createUser(validatedData);
            const responseData = UserDTO.transformResponse(createdUser);

            return res.status(201).json({
                status: "success",
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            const formattedUsers = users.map(user => UserDTO.transformResponse(user));

            return res.status(200).json({
                status: "success",
                results: formattedUsers.length,
                data: formattedUsers
            });
        } catch (error) {
            next(error);
        }
    }

    
    async getUserProfileWithPosts(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: true
            }
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return user;
    }

}

module.exports = new UserController();
