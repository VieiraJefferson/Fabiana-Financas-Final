const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const Video = require('../models/videoModel');

// @desc    Listar todos os vídeos
// @route   GET /api/admin/videos
// @access  Private (Admin only)
const getVideos = asyncHandler(async (req, res) => {
  try {
    console.log('📹 Listando vídeos...');
    
    const videos = await Video.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });

  } catch (error) {
    console.error('❌ Erro ao buscar vídeos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Criar novo vídeo
// @route   POST /api/admin/videos
// @access  Private (Admin only)
const createVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, difficulty, thumbnailUrl, videoUrl, duration, requiredPlan = 'free', tags = [], isPublished = false } = req.body;

    console.log('📹 Criando novo vídeo:', { title, category, difficulty });

    // Validações
    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, description, category, difficulty'
      });
    }

    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnail: thumbnailUrl,
      duration,
      category,
      difficulty,
      requiredPlan,
      tags,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user.id,
    });

    const savedVideo = await video.save();
    await savedVideo.populate('createdBy', 'name email');

    console.log('✅ Vídeo criado no banco:', savedVideo._id);

    res.status(201).json({
      success: true,
      message: 'Vídeo criado com sucesso!',
      data: savedVideo
    });

  } catch (error) {
    console.error('❌ Erro ao criar vídeo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Atualizar vídeo
// @route   PUT /api/admin/videos/:id
// @access  Private (Admin only)
const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Atualizando vídeo:', id, updates);

    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado'
      });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    console.log('✅ Vídeo atualizado no banco:', updatedVideo._id);

    res.json({
      success: true,
      message: 'Vídeo atualizado com sucesso!',
      data: updatedVideo
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar vídeo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Deletar vídeo
// @route   DELETE /api/admin/videos/:id
// @access  Private (Admin only)
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deletando vídeo:', id);

    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado'
      });
    }

    // TODO: Remover arquivos do Cloudinary se necessário
    // if (video.videoUrl) {
    //   const publicId = video.videoUrl.split('/').pop().split('.')[0];
    //   await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    // }

    await Video.findByIdAndDelete(id);

    console.log('✅ Vídeo deletado do banco:', id);

    res.json({
      success: true,
      message: 'Vídeo deletado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar vídeo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Upload de vídeo para Cloudinary
// @route   POST /api/admin/videos/upload
// @access  Private (Admin only)
const uploadVideo = asyncHandler(async (req, res) => {
  try {
    console.log('📤 Iniciando upload de vídeo...');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const file = req.file;
    console.log('📁 Arquivo recebido:', file.originalname, file.size);

    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'fabiana-financas/videos',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'mp4' }
      ]
    });

    console.log('✅ Upload concluído:', result.secure_url);

    res.json({
      success: true,
      message: 'Vídeo enviado com sucesso!',
      data: {
        videoUrl: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no upload do vídeo'
    });
  }
});

module.exports = {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  uploadVideo
}; 