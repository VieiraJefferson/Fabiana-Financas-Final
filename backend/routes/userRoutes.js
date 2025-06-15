const express = require('express');
const router = express.Router();
const { registerUser, authUser, updateUserProfile, updateUserPassword, updateUserProfilePhoto } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

router.route('/').post(registerUser);
router.route('/login').post(authUser);

// Nova rota para o perfil do usuário
// PUT /api/users/profile - Requer autenticação
router.route('/profile').put(protect, updateUserProfile);

router.route('/password').put(protect, updateUserPassword);

// Nova rota para upload da foto de perfil
router.route('/profile/photo').post(protect, upload.single('profileImage'), updateUserProfilePhoto);

module.exports = router; 