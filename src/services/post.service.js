const prisma = require('../config/prisma');
const UserDTO = require('../dtos/user.dto');
const { paginate } = require('../utils/pagination.util');
const { deleteFile } = require('../utils/upload.util');
const { emailQueue } = require('../queues/email.queue');

class PostService {
    async createPost(postData, file, userId) {
        let imagePath = null;
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }

        return await prisma.$transaction(async (tx) => {
            const userExists = await tx.user.findUnique({
                where: { id: userId }
            });

            if (!userExists) {
                const error = new Error("Validation Failed: The authenticated user session is invalid.");
                error.statusCode = 404;
                throw error;
            }

            const newPost = await tx.post.create({
                data: {
                    title: postData.title,
                    content: postData.content,
                    image: imagePath,
                    authorId: userId 
                }
            });

            await emailQueue.add('sendWelcomeEmail', {
            userId: userId,
            userEmail: "user@example.com", 
            postTitle: newPost.title
        }, { attempts: 3, backoff: 5000 }); 


            return newPost;
        });
    }

    async updatePost(postId, postData, file, userId) {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            const error = new Error("Post not found");
            error.statusCode = 404;
            throw error;
        }

        if (post.authorId !== userId) {
            const error = new Error("Unauthorized: You cannot update this post.");
            error.statusCode = 403;
            throw error;
        }

        let imagePath = post.image;

        if (file) {
            if (post.image) {
                deleteFile(post.image);
            }
            imagePath = `/uploads/${file.filename}`;
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                title: postData.title || post.title,
                content: postData.content || post.content,
                image: imagePath
            }
        });

        return updatedPost;
    }

    async getUserProfileWithPosts(userId, page, limit) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const transformedUser = UserDTO.transformResponse(user);
        
        const postsData = await paginate(
            prisma.post, 
            { 
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' }
            }, 
            page, 
            limit
        );

        return {
            data: {
                user: {
                    ...transformedUser,
                    posts: postsData.data
                }
            },
            meta: postsData.meta
        };
    }
}

module.exports = new PostService();
