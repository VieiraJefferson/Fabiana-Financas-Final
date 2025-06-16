const asyncHandler = require('express-async-handler');

// ============ ESTRUTURA DE CURSOS ============
// Curso -> Múltiplos Vídeos
// Cada curso tem: título, descrição, categoria, nível, múltiplos vídeos

// @desc    Listar todos os cursos
// @route   GET /api/admin/courses
// @access  Private (Admin only)
const getCourses = asyncHandler(async (req, res) => {
  try {
    // TODO: Implementar busca no banco de dados
    // Por enquanto retorna dados estruturados para cursos
    const courses = [
      {
        _id: '1',
        title: 'Fundamentos do Orçamento Pessoal',
        description: 'Curso completo sobre como criar e manter um orçamento eficiente',
        category: 'Orçamento',
        level: 'basic',
        thumbnail: 'https://res.cloudinary.com/dpilz4p6g/image/upload/v1/fabiana-financas/thumbnails/orcamento-curso.jpg',
        totalDuration: 3600, // em segundos
        videosCount: 4,
        enrollments: 1250,
        status: 'published',
        createdAt: new Date('2024-01-15'),
        videos: [
          {
            _id: '1-1',
            title: 'Introdução ao Orçamento',
            description: 'O que é orçamento e por que é importante',
            duration: 900, // 15 minutos
            order: 1,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/orcamento-intro.mp4',
            status: 'published'
          },
          {
            _id: '1-2', 
            title: 'Como Categorizar Gastos',
            description: 'Aprenda a organizar suas despesas por categoria',
            duration: 1200, // 20 minutos
            order: 2,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/categorizar-gastos.mp4',
            status: 'published'
          },
          {
            _id: '1-3',
            title: 'Definindo Metas Financeiras',
            description: 'Como estabelecer objetivos realistas',
            duration: 900, // 15 minutos
            order: 3,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/metas-financeiras.mp4',
            status: 'published'
          },
          {
            _id: '1-4',
            title: 'Controlando seu Orçamento',
            description: 'Ferramentas e técnicas para manter o controle',
            duration: 600, // 10 minutos
            order: 4,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/controle-orcamento.mp4',
            status: 'published'
          }
        ]
      },
      {
        _id: '2',
        title: 'Investimentos para Iniciantes',
        description: 'Primeiros passos no mundo dos investimentos',
        category: 'Investimentos',
        level: 'basic',
        thumbnail: 'https://res.cloudinary.com/dpilz4p6g/image/upload/v1/fabiana-financas/thumbnails/investimentos-curso.jpg',
        totalDuration: 5400, // 90 minutos
        videosCount: 6,
        enrollments: 890,
        status: 'published',
        createdAt: new Date('2024-01-10'),
        videos: [
          {
            _id: '2-1',
            title: 'O que são Investimentos?',
            description: 'Conceitos básicos e importância de investir',
            duration: 900,
            order: 1,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/intro-investimentos.mp4',
            status: 'published'
          },
          {
            _id: '2-2',
            title: 'Perfil de Investidor',
            description: 'Descubra seu perfil de risco',
            duration: 900,
            order: 2,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/perfil-investidor.mp4',
            status: 'published'
          }
          // ... mais vídeos
        ]
      },
      {
        _id: '3',
        title: 'Estratégias Avançadas de Investimento',
        description: 'Técnicas sofisticadas para investidores experientes',
        category: 'Investimentos',
        level: 'premium',
        thumbnail: 'https://res.cloudinary.com/dpilz4p6g/image/upload/v1/fabiana-financas/thumbnails/investimentos-avancado.jpg',
        totalDuration: 7200, // 2 horas
        videosCount: 8,
        enrollments: 456,
        status: 'published',
        createdAt: new Date('2024-01-08'),
        videos: [
          {
            _id: '3-1',
            title: 'Análise Fundamentalista',
            description: 'Como analisar empresas para investir',
            duration: 1800, // 30 minutos
            order: 1,
            videoUrl: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/fabiana-financas/videos/analise-fundamentalista.mp4',
            status: 'published'
          }
          // ... mais vídeos avançados
        ]
      }
    ];

    res.json(courses);
  } catch (error) {
    console.error('❌ Erro ao buscar cursos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Criar novo curso
// @route   POST /api/admin/courses
// @access  Private (Admin only)
const createCourse = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, level, thumbnailUrl, status = 'draft' } = req.body;

    // Validações
    if (!title || !description || !category || !level) {
      return res.status(400).json({
        message: 'Campos obrigatórios: title, description, category, level'
      });
    }

    // TODO: Implementar criação no banco de dados
    const newCourse = {
      _id: Date.now().toString(),
      title,
      description,
      category,
      level,
      thumbnail: thumbnailUrl,
      totalDuration: 0,
      videosCount: 0,
      enrollments: 0,
      status,
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Curso criado:', newCourse);

    res.status(201).json({
      message: 'Curso criado com sucesso!',
      course: newCourse
    });

  } catch (error) {
    console.error('❌ Erro ao criar curso:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Adicionar vídeo a um curso
// @route   POST /api/admin/courses/:courseId/videos
// @access  Private (Admin only)
const addVideoToCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl, duration, order } = req.body;

    // Validações
    if (!title || !description || !videoUrl) {
      return res.status(400).json({
        message: 'Campos obrigatórios: title, description, videoUrl'
      });
    }

    // TODO: Implementar no banco de dados
    const newVideo = {
      _id: `${courseId}-${Date.now()}`,
      title,
      description,
      videoUrl,
      duration: duration || 0,
      order: order || 1,
      status: 'published',
      createdAt: new Date()
    };

    console.log('✅ Vídeo adicionado ao curso:', courseId, newVideo);

    res.status(201).json({
      message: 'Vídeo adicionado ao curso com sucesso!',
      video: newVideo
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar vídeo ao curso:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Reordenar vídeos de um curso
// @route   PUT /api/admin/courses/:courseId/videos/reorder
// @access  Private (Admin only)
const reorderCourseVideos = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoOrders } = req.body; // Array de { videoId, order }

    // TODO: Implementar reordenação no banco de dados
    console.log('🔄 Reordenando vídeos do curso:', courseId, videoOrders);

    res.json({
      message: 'Vídeos reordenados com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao reordenar vídeos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Atualizar curso
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin only)
const updateCourse = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Implementar atualização no banco de dados
    console.log('📝 Atualizando curso:', id, updates);

    res.json({
      message: 'Curso atualizado com sucesso!',
      course: { _id: id, ...updates, updatedAt: new Date() }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar curso:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Deletar curso
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin only)
const deleteCourse = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implementar remoção no banco de dados
    // TODO: Remover todos os vídeos e thumbnails do Cloudinary
    console.log('🗑️ Deletando curso:', id);

    res.json({
      message: 'Curso deletado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar curso:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = {
  getCourses,
  createCourse,
  addVideoToCourse,
  reorderCourseVideos,
  updateCourse,
  deleteCourse
}; 