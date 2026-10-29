import { Request, Response, NextFunction } from 'express';
import postService from '../services/post.service.js';
import PostDTO from '../dtos/post.dto.js';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string | number;
        [key: string]: any;
    };
    file?: any; 
}

class PostController {
    createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const validatedData = PostDTO.validatePostInput(req.body);
            const userId = parseInt(req.user?.id as string);

            if (isNaN(userId)) {
                const error: any = new Error("Validation Failed: Invalid user ID format inside token.");
                error.statusCode = 401;
                throw error;
            }

            const newPost = await postService.createPost(validatedData, req.file, userId);
            const responseData = PostDTO.transformPostResponse(newPost);

            return res.status(201).json({
                status: "success",
                data: { post: responseData }
            });
        } catch (error) {
            next(error);
        }
    }

    updatePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user || !req.user.id) {
                const error: any = new Error("Authentication Failed: User identity not found inside request.");
                error.statusCode = 401;
                throw error;
            }

            const postId = parseInt((req.params as any).id);
            const userId = parseInt(req.user.id as string);

            if (isNaN(postId)) {
                const error: any = new Error("Validation Failed: Invalid post ID format.");
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
        } catch (error) {
            next(error);
        }
    }

    getUserProfileWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const userId = parseInt((req.params as any).userId);
            const page = req.query.page as string | undefined;
            const limit = req.query.limit as string | undefined;
            
            const result = await postService.getUserProfileWithPosts(userId, page, limit);

            return res.status(200).json({
                status: "success",
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PostController();
