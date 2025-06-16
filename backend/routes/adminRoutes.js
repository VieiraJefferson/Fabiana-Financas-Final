const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoPublish,
  getPlans,
  updatePlan,
} = require('../controllers/adminController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { requireAdmin, requireSuperAdmin } = require('../middleware/adminMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

// Dashboard Admin
router.route('/dashboard').get(protect, requireAdmin, getAdminDashboard);

// Gestão de Usuários
router.route('/users').get(protect, requireAdmin, getAllUsers);
router.route('/users/:id').put(protect, requireSuperAdmin, updateUserByAdmin);
router.route('/users/:id').delete(protect, requireSuperAdmin, deleteUser);

// Gestão de Vídeos
router.route('/videos').get(protect, requireAdmin, getAllVideos);
router.route('/videos').post(protect, requireAdmin, createVideo);
router.route('/videos/:id').put(protect, requireAdmin, updateVideo);
router.route('/videos/:id').delete(protect, requireAdmin, deleteVideo);
router.route('/videos/:id/publish').patch(protect, requireAdmin, toggleVideoPublish);

// Upload de vídeos/thumbnails
router.route('/upload/video').post(protect, requireAdmin, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
  
  res.json({
    message: 'Arquivo enviado com sucesso',
    fileUrl: `/${req.file.path.replace(/\\/g, "/")}`,
    filename: req.file.filename,
  });
});

router.route('/upload/thumbnail').post(protect, requireAdmin, upload.single('thumbnail'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
  
  res.json({
    message: 'Thumbnail enviado com sucesso',
    fileUrl: `/${req.file.path.replace(/\\/g, "/")}`,
    filename: req.file.filename,
  });
});

// Gestão de Planos
router.route('/plans').get(protect, requireAdmin, getPlans);
router.route('/plans/:id').put(protect, requireSuperAdmin, updatePlan);

module.exports = router; 