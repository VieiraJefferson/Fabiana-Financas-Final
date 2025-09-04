const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../utils/tokenManager.js');

// Middleware de autenticação obrigatória
function requireAuth(optional = false) {
  return (req, res, next) => {
    const token = req.cookies?.access_token;
    
    if (!token) {
      if (optional) return next();
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (e) {
      if (optional) return next();
      return res.status(401).json({ error: 'Token inválido/expirado' });
    }
  };
}

// Middleware para verificar role específico
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Acesso proibido - role insuficiente' });
    }
    
    next();
  };
}

// Middleware para verificar múltiplos roles
function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso proibido - role insuficiente',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
}

// Middleware para verificar se é admin (role admin ou super_admin)
function requireAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    const adminRoles = ['admin', 'super_admin'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso proibido - apenas administradores',
        required: adminRoles,
        current: req.user.role
      });
    }
    
    next();
  };
}

// Middleware para verificar se é super admin
function requireSuperAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Acesso proibido - apenas super administradores',
        required: 'super_admin',
        current: req.user.role
      });
    }
    
    next();
  };
}

// Middleware para verificar se o usuário está ativo
function requireActiveUser() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (req.user.isActive === false) {
      return res.status(403).json({ error: 'Conta desativada' });
    }
    
    next();
  };
}

// Middleware para verificar se o usuário pode acessar recursos de outro usuário
function requireOwnershipOrAdmin(userIdField = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    // Admin pode acessar qualquer recurso
    if (['admin', 'super_admin'].includes(req.user.role)) {
      return next();
    }
    
    // Usuário comum só pode acessar seus próprios recursos
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: 'Acesso proibido - apenas recursos próprios ou admin',
        resourceOwner: resourceUserId,
        currentUser: req.user.id
      });
    }
    
    next();
  };
}

// Middleware para logging de acesso
function logAccess(action) {
  return (req, res, next) => {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      userId: req.user?.id,
      userRole: req.user?.role,
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    console.log('🔐 Access Log:', logData);
    
    // Aqui você pode salvar no banco de dados para auditoria
    // await AccessLog.create(logData);
    
    next();
  };
}

module.exports = { 
  requireAuth, 
  requireRole, 
  requireAnyRole,
  requireAdmin, 
  requireSuperAdmin,
  requireActiveUser,
  requireOwnershipOrAdmin,
  logAccess
}; 