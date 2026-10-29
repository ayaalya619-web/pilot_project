import PostDTO from './post.dto.js';
class UserDTO {
    static validateCreateInput(data) {
        const { username, email, password } = data;
        if (!username || !email || !password) {
            throw new Error("Validation Failed: username, email, and password are required.");
        }
        if (password.length < 6) {
            throw new Error("Validation Failed: Password must be at least 6 characters long.");
        }
        return { username, email, password };
    }
    static transformResponse(user) {
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
