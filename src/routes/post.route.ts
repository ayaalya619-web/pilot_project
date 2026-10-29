import express, { Router } from 'express';
import postController from '../controllers/post.controller.js';
import authGuard from '../middlewares/auth.guard.js';
import { upload } from '../utils/upload.util.js';
//import postLimiter from '../middlewares/rateLimiter.middleware.js';

const router: Router = express.Router();

router.post('/', authGuard, upload.single('image'), postController.createPost);
router.put('/:id', authGuard, upload.single('image'), postController.updatePost);

router.get('/user/:userId', postController.getUserProfileWithPosts);

export default router;
