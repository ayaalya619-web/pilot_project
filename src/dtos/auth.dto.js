const { z } = require('zod');

const registerSchema = z.object({
    username: z.string({ required_error: "Validation Failed: username is required." })
               .min(1, { message: "Validation Failed: username is required." })
               .trim(),
    email: z.string({ required_error: "Validation Failed: email is required." })
            .email({ message: "Validation Failed: Invalid email format." })
            .trim(),
    password: z.string({ required_error: "Validation Failed: password is required." })
               .min(6, { message: "Validation Failed: Password must be at least 6 characters long." })
});

const loginSchema = z.object({
    email: z.string({ required_error: "Validation Failed: email is required." })
            .email({ message: "Validation Failed: Invalid email format." })
            .trim(),
    password: z.string({ required_error: "Validation Failed: password is required." })
               .min(1, { message: "Validation Failed: password is required." })
});

class AuthDTO {
    static validateRegisterInput(data) {
        return registerSchema.parse(data);
    }

    static validateLoginInput(data) {
        return loginSchema.parse(data);
    }

    static transformAuthResponse(user, token) {
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        };
    }
}

module.exports = AuthDTO;
