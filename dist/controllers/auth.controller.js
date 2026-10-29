import authService from '../services/auth.service.js';
import AuthDTO from '../dtos/auth.dto.js';
class AuthController {
    async register(req, res, next) {
        try {
            const validatedData = AuthDTO.validateRegisterInput(req.body);
            const { user, accessToken, refreshToken } = await authService.register(validatedData);
            const responseData = AuthDTO.transformAuthResponse(user, accessToken, refreshToken);
            return res.status(201).json({
                status: "success",
                data: responseData
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const validatedData = AuthDTO.validateLoginInput(req.body);
            const { user, accessToken, refreshToken } = await authService.login(validatedData);
            const responseData = AuthDTO.transformAuthResponse(user, accessToken, refreshToken);
            return res.status(200).json({
                status: "success",
                data: responseData
            });
        }
        catch (error) {
            next(error);
        }
    }
    refresh = async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshTokens(refreshToken);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const token = req.token;
            const user = req.user;
            const expireSeconds = user.exp - Math.floor(Date.now() / 1000);
            await authService.logout(token, req.body.refreshToken, expireSeconds);
            return res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
        }
        catch (error) {
            next(error);
        }
    };
}
export default new AuthController();
