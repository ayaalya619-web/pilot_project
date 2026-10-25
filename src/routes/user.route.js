const { Router } = require('express');
const router = Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller')
const authGuard = require('../middlewares/auth.guard');


router.post('/', userController.createUser);
router.get('/', authGuard, userController.getAllUsers.bind(userController));


router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

module.exports = router;
