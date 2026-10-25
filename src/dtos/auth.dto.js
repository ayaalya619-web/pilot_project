class AuthDTO {
    static validateRegisterInput(data) {
        const { username, email, password } = data;
        if (!username || !email || !password) {
            throw new Error("Validation Failed: username, email, and password are required.");
        }
        if (password.length < 6) {
            throw new Error("Validation Failed: Password must be at least 6 characters long.");
        }
        return { username, email, password };
    }

    static validateLoginInput(data) {
        const { email, password } = data;
        if (!email || !password) {
            throw new Error("Validation Failed: email and password are required.");
        }
        return { email, password };
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
