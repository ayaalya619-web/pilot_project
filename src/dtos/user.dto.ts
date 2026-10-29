import PostDTO from './post.dto.js';

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
}

interface UserPayload {
    id: string | number;
    username: string;
    email: string;
    createdAt: Date | string;
    posts?: any[];
    [key: string]: any;
}

interface UserResponse {
    id: string | number;
    username: string;
    email: string;
    createdAt: Date | string;
    posts: any[];
}

class UserDTO {
    static validateCreateInput(data: any): CreateUserInput {
        const { username, email, password } = data;
        if (!username || !email || !password) {
            throw new Error("Validation Failed: username, email, and password are required.");
        }
        if (password.length < 6) {
            throw new Error("Validation Failed: Password must be at least 6 characters long.");
        }
        return { username, email, password };
    }

    static transformResponse(user: UserPayload): UserResponse {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            posts: user.posts ? user.posts.map(post => PostDTO.transformPostResponse(post)) : []
        };
    }
}

export default UserDTO;
