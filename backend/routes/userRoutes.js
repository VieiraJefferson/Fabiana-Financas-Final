const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile, updateUserPassword, updateUserProfilePhoto } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

router.route('/').post(registerUser);
router.route('/login').post(authUser);

// Rotas para o perfil do usuário
// GET /api/users/profile - Buscar perfil
// PUT /api/users/profile - Atualizar perfil
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/password').put(protect, updateUserPassword);

// Nova rota para upload da foto de perfil
router.route('/profile/photo').post(protect, upload.single('profileImage'), updateUserProfilePhoto);

// Rota de debug para verificar se a imagem está no banco
router.route('/debug-image').get(protect, async (req, res) => {
  try {
    const { User } = require('../models/userModel.js');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      hasImage: !!user.image,
      imageSize: user.image ? user.image.length : 0,
      imagePreview: user.image ? user.image.substring(0, 100) + '...' : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar imagem', error: error.message });
  }
});

module.exports = router; 