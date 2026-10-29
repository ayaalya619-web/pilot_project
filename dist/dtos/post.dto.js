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
    mimetype: z.string().refine((type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type), { message: "Validation Failed: Invalid file type. Only JPEG, PNG, and WEBP are allowed." }),
    size: z.number().max(5 * 1024 * 1024, {
        message: "Validation Failed: File size exceeds the 5MB limit."
    })
}).optional();
class PostDTO {
    static validatePostInput(data, file) {
        const validatedBody = postSchema.parse(data);
        if (file) {
            fileSchema.parse(file);
        }
        return validatedBody;
    }
    static validatePostUpdateInput(data, file) {
        const validatedBody = updatePostSchema.parse(data);
        if (file) {
            fileSchema.parse(file);
        }
        return validatedBody;
    }
    static transformPostResponse(post) {
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
