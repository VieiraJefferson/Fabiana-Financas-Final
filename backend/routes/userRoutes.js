const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController.js');
const { requireAuth } = require('../middleware/adminMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

// Rotas públicas
router.post('/register', ctrl.registerUser);
router.post('/login', ctrl.authUser);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);

// Rotas protegidas
router.get('/me', requireAuth(), ctrl.getUserProfile);
router.put('/me', requireAuth(), ctrl.updateUserProfile);
router.put('/password', requireAuth(), ctrl.updateUserPassword);
router.post('/profile/photo', requireAuth(), upload.single('profileImage'), ctrl.updateUserProfilePhoto);
router.post('/logout-all', requireAuth(), ctrl.logoutAll);
router.get('/sessions', requireAuth(), ctrl.getSessionStats);

// Rota de debug para verificar se a imagem está no banco
router.get('/debug-image', requireAuth(), async (req, res) => {
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