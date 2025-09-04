const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel.js');
const RefreshRepo = require('../repos/refreshRepo.js');
const { v4: uuid } = require('uuid');
const { 
  generateTokenPair, 
  setAuthCookies, 
  clearAuthCookies
} = require('../utils/tokenManager.js');

// @desc    Login de administrador
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário com role admin
    const admin = await User.findOne({ 
      email, 
      role: { $in: ['admin', 'super_admin'] },
      isActive: true
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Admin não encontrado ou inativo' });
    }

    // Verificar senha
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar tokens para admin
    const payload = { 
      id: admin._id.toString(), 
      role: admin.role,
      type: 'access'
    };
    
    const jti = uuid();
    const { accessToken, refreshToken } = generateTokenPair(admin._id);
    
    // Salvar refresh token no repositório
    await RefreshRepo.save(jti, admin._id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceId: req.headers['x-device-id'] || 'unknown'
    });
    
    // Incrementar sessões ativas
    await admin.incrementActiveSessions();
    
    // Configurar cookies
    setAuthCookies(res, accessToken, refreshToken);
    
    res.json({ 
      admin: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email, 
        role: admin.role 
      },
      message: 'Login de administrador realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Perfil do administrador
// @route   GET /api/admin/me
// @access  Private (Admin)
const adminMe = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id).select('name email role isAdmin plan planExpiry');
    
    if (!admin) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }
    
    // Verificar se ainda é admin
    if (!['admin', 'super_admin'].includes(admin.role)) {
      return res.status(403).json({ error: 'Acesso negado - permissões de admin revogadas' });
    }
    
    res.json({ admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Listar todos os usuários (apenas admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    
    const query = {};
    
    // Filtro por busca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por role
    if (role) {
      query.role = role;
    }
    
    // Filtro por status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('name email role isAdmin plan isActive lastLogin activeSessions createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário específico (apenas admin)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Buscar sessões ativas
    const activeTokens = await RefreshRepo.findValidByUserId(user._id);
    const tokenAudit = await RefreshRepo.findWithAudit(user._id, 10);
    
    res.json({
      user: {
        ...user.toObject(),
        activeSessions: user.activeSessions,
        activeTokens: activeTokens.length,
        recentSessions: tokenAudit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar usuário (apenas admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, plan, planExpiry } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se não está tentando alterar um super_admin (apenas super_admin pode)
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Apenas super administradores podem modificar super administradores' });
    }
    
    // Atualizar campos permitidos
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (plan !== undefined) updateData.plan = plan;
    if (planExpiry !== undefined) updateData.planExpiry = planExpiry;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      user: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Desativar/ativar usuário (apenas admin)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se não está tentando desativar um super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Apenas super administradores podem desativar super administradores' });
    }
    
    const newStatus = !user.isActive;
    
    // Se estiver desativando, revogar todos os tokens
    if (!newStatus) {
      await RefreshRepo.revokeAllByUserId(user._id);
      await User.findByIdAndUpdate(user._id, { activeSessions: 0 });
    }
    
    user.isActive = newStatus;
    await user.save();
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      },
      message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revogar todas as sessões de um usuário (apenas admin)
// @route   POST /api/admin/users/:id/revoke-sessions
// @access  Private (Admin)
const revokeUserSessions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Revogar todos os refresh tokens
    const revokedCount = await RefreshRepo.revokeAllByUserId(user._id);
    
    // Zerar sessões ativas
    await User.findByIdAndUpdate(user._id, { activeSessions: 0 });
    
    res.json({ 
      message: `${revokedCount} sessões revogadas com sucesso`,
      revokedSessions: revokedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Estatísticas do sistema (apenas admin)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = async (req, res, next) => {
  try {
    // Estatísticas de usuários
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } });
    
    // Estatísticas de tokens
    const tokenStats = await RefreshRepo.getStats();
    
    // Estatísticas de planos
    const planStats = await User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Usuários por role
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers
      },
      tokens: tokenStats,
      plans: planStats,
      roles: roleStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout de administrador
// @route   POST /api/admin/logout
// @access  Private (Admin)
const adminLogout = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    
    if (refresh_token) {
      try {
        const { verifyRefreshToken } = require('../utils/tokenManager.js');
        const decoded = verifyRefreshToken(refresh_token);
        if (decoded.jti) {
          await RefreshRepo.revoke(decoded.jti);
        }
      } catch (error) {
        console.log('Refresh token inválido durante logout:', error.message);
      }
    }
    
    // Decrementar sessões ativas
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { activeSessions: -1 }
      });
    }
    
    // Limpar cookies
    clearAuthCookies(res);
    
    res.json({ message: 'Logout de administrador realizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminMe,
  listUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  revokeUserSessions,
  getSystemStats,
  adminLogout
}; 