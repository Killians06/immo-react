const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const {checkUser, requireAuth} = require('../middleware/auth.middleware');
const uploadController = require('../controllers/upload.controller');
const multer = require('multer');
const upload = multer();



//Auth
router.post('/register', authController.signUp);
router.post('/login', authController.signIn);
router.get('/logout', authController.logout);

//User DB
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.post("/upload/:id", upload.single('file'), uploadController.uploadUser);
router.delete("/upload/:id", userController.pictureUserDelete);

module.exports = router;