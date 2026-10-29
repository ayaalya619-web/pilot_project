import prisma from '../config/prisma.js';
import UserDTO from '../dtos/user.dto.js';
import { paginate } from '../utils/pagination.util.js';
import { deleteFile } from '../utils/upload.util.js';
import { emailQueue } from '../queues/email.queue.js';
import { sendNotificationToUser } from '../config/socket.js';
import { sendTelegramNotification } from '../config/telegram.js';
import { PostInput, PostUpdateInput } from '../dtos/post.dto.js';

interface CustomError extends Error {
    statusCode?: number;
}

class PostService {
    async createPost(postData: PostInput, file: any, userId: number) {
        let imagePath: string | null = null;
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }

        return await prisma.$transaction(async (tx) => {
            const userExists = await tx.user.findUnique({
                where: { id: userId }
            });

            if (!userExists) {
                const error: CustomError = new Error("Validation Failed: The authenticated user session is invalid.");
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

            sendNotificationToUser(userId, {
                title: "تم نشر منشورك بنجاح! 🚀",
                message: `منشورك الجديد بعنوان "${newPost.title}" أصبح حياً الآن على المنصة.`,
                payload: { postId: newPost.id }
            });

            const MY_TELEGRAM_CHAT_ID = 810564647; 

            const telegramMessage = `<b>🔔 إشعار تجريبي من السيرفر</b>\n\nتم نشر منشور جديد بنجاح! 🎉\n📝 <b>العنوان:</b> ${newPost.title}`;
            
            await sendTelegramNotification(MY_TELEGRAM_CHAT_ID, telegramMessage);

            return newPost;
        });
    }

    async updatePost(postId: number, postData: PostUpdateInput, file: any, userId: number) {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            const error: CustomError = new Error("Post not found");
            error.statusCode = 404;
            throw error;
        }

        if (post.authorId !== userId) {
            const error: CustomError = new Error("Unauthorized: You cannot update this post.");
            error.statusCode = 403;
            throw error;
        }

        let imagePath: string | null = post.image;

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

    async getUserProfileWithPosts(userId: number, page: string | undefined, limit: string | undefined) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const error: CustomError = new Error("User not found");
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

export default new PostService();
