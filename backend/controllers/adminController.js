const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel.js');
const Video = require('../models/videoModel.js');
const Plan = require('../models/planModel.js');

// @desc    Obter estatísticas do dashboard admin
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const premiumUsers = await User.countDocuments({ plan: { $ne: 'free' } });
  const totalVideos = await Video.countDocuments();
  const publishedVideos = await Video.countDocuments({ isPublished: true });
  
  // Usuários por plano
  const usersByPlan = await User.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } }
  ]);

  // Novos usuários nos últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.json({
    totalUsers,
    activeUsers,
    premiumUsers,
    totalVideos,
    publishedVideos,
    usersByPlan,
    newUsers,
  });
});

// @desc    Listar todos os usuários
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
});

// @desc    Atualizar usuário (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/SuperAdmin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { role, plan, isActive, planExpiry } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  if (role) user.role = role;
  if (plan) user.plan = plan;
  if (typeof isActive !== 'undefined') user.isActive = isActive;
  if (planExpiry) user.planExpiry = planExpiry;
  
  // Atualizar isAdmin baseado no role para compatibilidade
  user.isAdmin = role === 'admin' || role === 'super_admin';

  const updatedUser = await user.save();
  
  res.json({
    message: 'Usuário atualizado com sucesso',
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      plan: updatedUser.plan,
      isActive: updatedUser.isActive,
      planExpiry: updatedUser.planExpiry,
    }
  });
});

// @desc    Deletar usuário
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  await User.findByIdAndDelete(req.params.id);
  
  res.json({ message: 'Usuário deletado com sucesso' });
});

// @desc    Listar todos os vídeos
// @route   GET /api/admin/videos
// @access  Private/Admin
const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  
  res.json(videos);
});

// @desc    Criar novo vídeo
// @route   POST /api/admin/videos
// @access  Private/Admin
const createVideo = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    thumbnail,
    duration,
    category,
    difficulty,
    requiredPlan,
    tags,
    order
  } = req.body;

  const video = new Video({
    title,
    description,
    videoUrl,
    thumbnail,
    duration,
    category,
    difficulty,
    requiredPlan,
    tags,
    order,
    createdBy: req.user.id,
  });

  const createdVideo = await video.save();
  await createdVideo.populate('createdBy', 'name email');
  
  res.status(201).json(createdVideo);
});

// @desc    Atualizar vídeo
// @route   PUT /api/admin/videos/:id
// @access  Private/Admin
const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    res.status(404);
    throw new Error('Vídeo não encontrado');
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');
  
  res.json(updatedVideo);
});

// @desc    Deletar vídeo
// @route   DELETE /api/admin/videos/:id
// @access  Private/Admin
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    res.status(404);
    throw new Error('Vídeo não encontrado');
  }

  await Video.findByIdAndDelete(req.params.id);
  
  res.json({ message: 'Vídeo deletado com sucesso' });
});

// @desc    Publicar/despublicar vídeo
// @route   PATCH /api/admin/videos/:id/publish
// @access  Private/Admin
const toggleVideoPublish = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    res.status(404);
    throw new Error('Vídeo não encontrado');
  }

  video.isPublished = !video.isPublished;
  video.publishedAt = video.isPublished ? new Date() : null;
  
  await video.save();
  
  res.json({
    message: `Vídeo ${video.isPublished ? 'publicado' : 'despublicado'} com sucesso`,
    video
  });
});

// @desc    Obter configurações de planos
// @route   GET /api/admin/plans
// @access  Private/Admin
const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort({ order: 1 });
  res.json(plans);
});

// @desc    Atualizar plano
// @route   PUT /api/admin/plans/:id
// @access  Private/SuperAdmin
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('Plano não encontrado');
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json(updatedPlan);
});

module.exports = {
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
}; 