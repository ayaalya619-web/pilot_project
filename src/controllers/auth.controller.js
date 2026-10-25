const authService = require('../services/auth.service');
const AuthDTO = require('../dtos/auth.dto');

class AuthController {
    async register(req, res, next) {
        try {
            const validatedData = AuthDTO.validateRegisterInput(req.body);
            const { user, token } = await authService.register(validatedData);
            const responseData = AuthDTO.transformAuthResponse(user, token);

            return res.status(201).json({
                status: "success",
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const validatedData = AuthDTO.validateLoginInput(req.body);
            const { user, token } = await authService.login(validatedData);
            const responseData = AuthDTO.transformAuthResponse(user, token);

            return res.status(200).json({
                status: "success",
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
