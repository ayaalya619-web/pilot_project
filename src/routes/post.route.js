const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authGuard = require('../middlewares/auth.guard');
const {upload} = require('../utils/upload.util'); 

router.post('/',authGuard, upload.single('image'), postController.createPost);
router.put('/:id', authGuard, upload.single('image'), postController.updatePost);

router.get('/user/:userId', postController.getUserProfileWithPosts);

module.exports = router;
