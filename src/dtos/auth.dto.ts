import { z } from 'zod';

const registerSchema = z.object({
    username: z.string({ message: "Validation Failed: username is required." })
               .min(1, { message: "Validation Failed: username is required." })
               .trim(),
    email: z.string({ message: "Validation Failed: email is required." })
            .email({ message: "Validation Failed: Invalid email format." })
            .trim(),
    password: z.string({ message: "Validation Failed: password is required." })
               .min(6, { message: "Validation Failed: Password must be at least 6 characters long." })
});

const loginSchema = z.object({
    email: z.string({ message: "Validation Failed: email is required." })
            .email({ message: "Validation Failed: Invalid email format." })
            .trim(),
    password: z.string({ message: "Validation Failed: password is required." })
               .min(1, { message: "Validation Failed: password is required." })
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

interface UserPayload {
    id: string | number;
    username: string;
    email: string;
    [key: string]: any;
}

interface AuthResponse {
    id: string | number;
    username: string;
    email: string;
    accessToken: string;
    refreshToken?: string;
}

class AuthDTO {
    static validateRegisterInput(data: unknown): RegisterInput {
        return registerSchema.parse(data);
    }

    static validateLoginInput(data: unknown): LoginInput {
        return loginSchema.parse(data);
    }

    static transformAuthResponse(user: UserPayload, accessToken: string, refreshToken?: string): AuthResponse {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken
        };
    }
}

export default AuthDTO;
