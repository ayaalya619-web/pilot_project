import userService from '../services/user.service.js';
import UserDTO from '../dtos/user.dto.js';
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
        }
        catch (error) {
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
        }
        catch (error) {
            next(error);
        }
    }
}
export default new UserController();
