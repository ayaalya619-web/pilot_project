import { z } from 'zod';

const postSchema = z.object({
    title: z.string({ message: "Validation Failed: title is required." })
            .min(3, { message: "Validation Failed: Title must be at least 3 characters long." })
            .max(100)
            .trim(),
            
    content: z.string({ message: "Validation Failed: content is required." })
              .min(10, { message: "Validation Failed: Content must be at least 10 characters long." })
              .trim(),
});


const updatePostSchema = postSchema.partial();

const fileSchema = z.object({
    mimetype: z.string().refine(
        (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
        { message: "Validation Failed: Invalid file type. Only JPEG, PNG, and WEBP are allowed." }
    ),
    size: z.number().max(5 * 1024 * 1024, {
        message: "Validation Failed: File size exceeds the 5MB limit."
    })
}).optional();

export type PostInput = z.infer<typeof postSchema>;
export type PostUpdateInput = z.infer<typeof updatePostSchema>;

interface PostPayload {
    id: string | number;
    title: string;
    content: string;
    image?: string | null;
    createdAt: Date | string;
    [key: string]: any;
}

interface PostResponse {
    id: string | number;
    title: string;
    content: string;
    image?: string | null;
    createdAt: Date | string;
}

class PostDTO {
    static validatePostInput(data: unknown, file?: unknown): PostInput {
        const validatedBody = postSchema.parse(data);
        if (file) {
            fileSchema.parse(file);
        }
        return validatedBody;
    }

    static validatePostUpdateInput(data: unknown, file?: unknown): PostUpdateInput {
        const validatedBody = updatePostSchema.parse(data);
        if (file) {
            fileSchema.parse(file);
        }
        return validatedBody;
    }

    static transformPostResponse(post: PostPayload): PostResponse {
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            image: post.image,
            createdAt: post.createdAt
        };
    }
}

export default PostDTO;
