const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');

// @desc    Listar todos os vídeos
// @route   GET /api/admin/videos
// @access  Private (Admin only)
const getVideos = asyncHandler(async (req, res) => {
  try {
    console.log('📹 Listando vídeos...');
    
    // TODO: Implementar busca no banco de dados
    // Por enquanto retorna dados mockados
    const videos = [
      {
        _id: '1',
        title: 'Introdução ao Orçamento Pessoal',
        description: 'Como começar a organizar suas finanças',
        category: 'Orçamento',
        level: 'basic',
        duration: 900,
        thumbnail: 'https://res.cloudinary.com/dpilz4p6g/image/upload/v1/fabiana-financas/thumbnails/orcamento-intro.jpg',
        videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/orcamento-intro.mp4',
        status: 'published',
        views: 1250,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        title: 'Primeiros Passos nos Investimentos',
        description: 'Conceitos básicos sobre investir seu dinheiro',
        category: 'Investimentos',
        level: 'basic',
        duration: 1200,
        thumbnail: 'https://res.cloudinary.com/dpilz4p6g/image/upload/v1/fabiana-financas/thumbnails/investimentos-intro.jpg',
        videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/investimentos-intro.mp4',
        status: 'published',
        views: 890,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];

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
    const { title, description, category, level, thumbnailUrl, videoUrl, duration, status = 'draft' } = req.body;

    console.log('📹 Criando novo vídeo:', { title, category, level });

    // Validações
    if (!title || !description || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, description, category, level'
      });
    }

    // TODO: Implementar criação no banco de dados
    const newVideo = {
      _id: Date.now().toString(),
      title,
      description,
      category,
      level,
      thumbnail: thumbnailUrl,
      videoUrl,
      duration: duration || 0,
      status,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Vídeo criado:', newVideo);

    res.status(201).json({
      success: true,
      message: 'Vídeo criado com sucesso!',
      data: newVideo
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

    // TODO: Implementar atualização no banco de dados
    const updatedVideo = { 
      _id: id, 
      ...updates, 
      updatedAt: new Date() 
    };

    console.log('✅ Vídeo atualizado:', updatedVideo);

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

    // TODO: Implementar remoção no banco de dados
    // TODO: Remover arquivos do Cloudinary

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