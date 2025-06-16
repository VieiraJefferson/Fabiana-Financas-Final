const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
  getAllVideos,
  createVideo: createVideoAdmin,
  updateVideo: updateVideoAdmin,
  deleteVideo: deleteVideoAdmin,
  toggleVideoPublish,
  getPlans,
  updatePlan,
} = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const { requireAdmin, requireSuperAdmin } = require('../middleware/adminMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');
const uploadVideo = require('../middleware/uploadVideoMiddleware.js');
const { 
  uploadVideo: uploadVideoController,
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} = require('../controllers/videoController.js');

const {
  getCourses,
  createCourse,
  addVideoToCourse,
  reorderCourseVideos,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController.js');

// Todas as rotas requerem autenticação e permissão de admin
router.use(protect);
router.use(admin);

// ============ ROTAS DE VÍDEOS ============

// GET /api/admin/videos - Listar todos os vídeos
router.get('/videos', getVideos);

// POST /api/admin/videos - Criar novo vídeo
router.post('/videos', createVideo);

// POST /api/admin/videos/upload - Upload de vídeo e thumbnail
router.post('/videos/upload', uploadVideo, uploadVideoController);

// PUT /api/admin/videos/:id - Atualizar vídeo
router.put('/videos/:id', updateVideo);

// DELETE /api/admin/videos/:id - Deletar vídeo
router.delete('/videos/:id', deleteVideo);

// ============ ROTAS DE USUÁRIOS (FUTURO) ============
// TODO: Implementar rotas para gerenciar usuários

// ============ ROTAS DE CURSOS ============

// GET /api/admin/courses - Listar todos os cursos
router.get('/courses', getCourses);

// POST /api/admin/courses - Criar novo curso
router.post('/courses', createCourse);

// PUT /api/admin/courses/:id - Atualizar curso
router.put('/courses/:id', updateCourse);

// DELETE /api/admin/courses/:id - Deletar curso
router.delete('/courses/:id', deleteCourse);

// POST /api/admin/courses/:courseId/videos - Adicionar vídeo ao curso
router.post('/courses/:courseId/videos', addVideoToCourse);

// PUT /api/admin/courses/:courseId/videos/reorder - Reordenar vídeos do curso
router.put('/courses/:courseId/videos/reorder', reorderCourseVideos);

// ============ ROTAS DE ANALYTICS (FUTURO) ============
// TODO: Implementar rotas para analytics e relatórios

// Dashboard Admin
router.route('/dashboard').get(requireAdmin, getAdminDashboard);

// Gestão de Usuários
router.route('/users').get(requireAdmin, getAllUsers);
router.route('/users/:id').put(requireSuperAdmin, updateUserByAdmin);
router.route('/users/:id').delete(requireSuperAdmin, deleteUser);

// Gestão de Vídeos (rotas mais específicas ficam por último)
router.route('/videos/:id/publish').patch(requireAdmin, toggleVideoPublish);

// Upload de vídeos/thumbnails
router.route('/upload/video').post(requireAdmin, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
  
  res.json({
    message: 'Arquivo enviado com sucesso',
    fileUrl: `/${req.file.path.replace(/\\/g, "/")}`,
    filename: req.file.filename,
  });
});

router.route('/upload/thumbnail').post(requireAdmin, upload.single('thumbnail'), (req, res) => {
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
router.route('/plans').get(requireAdmin, getPlans);
router.route('/plans/:id').put(requireSuperAdmin, updatePlan);

module.exports = router; 