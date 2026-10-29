import postService from '../services/post.service.js';
import PostDTO from '../dtos/post.dto.js';
class PostController {
    createPost = async (req, res, next) => {
        try {
            const validatedData = PostDTO.validatePostInput(req.body);
            const userId = parseInt(req.user?.id);
            if (isNaN(userId)) {
                const error = new Error("Validation Failed: Invalid user ID format inside token.");
                error.statusCode = 401;
                throw error;
            }
            const newPost = await postService.createPost(validatedData, req.file, userId);
            const responseData = PostDTO.transformPostResponse(newPost);
            return res.status(201).json({
                status: "success",
                data: { post: responseData }
            });
        }
        catch (error) {
            next(error);
        }
    };
    updatePost = async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                const error = new Error("Authentication Failed: User identity not found inside request.");
                error.statusCode = 401;
                throw error;
            }
            const postId = parseInt(req.params.id);
            const userId = parseInt(req.user.id);
            if (isNaN(postId)) {
                const error = new Error("Validation Failed: Invalid post ID format.");
                error.statusCode = 400;
                throw error;
            }
            const validatedData = PostDTO.validatePostUpdateInput(req.body, req.file);
            const updatedPost = await postService.updatePost(postId, validatedData, req.file, userId);
            const responseData = PostDTO.transformPostResponse(updatedPost);
            return res.status(200).json({
                status: "success",
                data: { post: responseData }
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUserProfileWithPosts = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            const page = req.query.page;
            const limit = req.query.limit;
            const result = await postService.getUserProfileWithPosts(userId, page, limit);
            return res.status(200).json({
                status: "success",
                ...result
            });
        }
        catch (error) {
            next(error);
        }
    };
}
export default new PostController();
