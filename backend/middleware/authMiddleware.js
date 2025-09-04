const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel.js');
const { verifyAccessToken } = require('../utils/tokenManager.js');

const protect = asyncHandler(async (req, res, next) => {
  console.log('=== DEBUG AUTH MIDDLEWARE ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  let token;

  // Primeiro, tentar obter token dos cookies (preferencial)
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
    console.log('Token obtido dos cookies (access_token)');
  }
  // Fallback para o header Authorization (para compatibilidade)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token obtido do header Authorization');
  }

  if (!token) {
    console.log('❌ Nenhum token de acesso encontrado');
    res.status(401);
    throw new Error('Não autorizado, sem token de acesso');
  }

  try {
    // Verificar access token
    const decoded = verifyAccessToken(token);
    console.log('✅ Token decodificado:', decoded);

    // Obter usuário do token (sem a senha)
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.log('❌ Usuário não encontrado no banco');
      res.status(401);
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o usuário está ativo
    if (!req.user.isActive) {
      console.log('❌ Usuário inativo');
      res.status(401);
      throw new Error('Conta desativada');
    }

    console.log('✅ Usuário autenticado:', {
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error('❌ Erro de autenticação:', error.message);
    
    // Se o token expirou, tentar renovar automaticamente
    if (error.message.includes('expirado') && req.cookies?.refresh_token) {
      console.log('🔄 Tentando renovar token automaticamente...');
      
      try {
        // Fazer requisição para renovar token
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/users/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        
        if (response.ok) {
          console.log('✅ Token renovado automaticamente');
          // Continuar com a requisição original
          return next();
        }
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError.message);
      }
    }
    
    res.status(401);
    throw new Error('Não autorizado, token inválido');
  }
});

// Middleware para verificar se o usuário é admin
const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Acesso negado. Apenas administradores.');
  }
};

// Middleware para verificar role específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Não autorizado');
    }
    
    const userRole = req.user.role || (req.user.isAdmin ? 'admin' : 'user');
    
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403);
      throw new Error(`Acesso negado. Roles permitidos: ${roles.join(', ')}`);
    }
  };
};

module.exports = { protect, admin, requireRole }; 