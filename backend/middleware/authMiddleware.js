const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel.js');

const protect = asyncHandler(async (req, res, next) => {
  console.log('=== DEBUG AUTH MIDDLEWARE ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Authorization header:', req.headers.authorization);
  console.log('All headers:', req.headers);
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token recebido:', token ? 'Presente' : 'Ausente');

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodificado:', decoded);

      // Obter usuário do token (sem a senha)
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Usuário encontrado:', req.user ? 'Sim' : 'Não');
      
      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      res.status(401);
      throw new Error('Não autorizado, token inválido');
    }
  } else {
    console.log('Nenhum token de autorização encontrado');
    res.status(401);
    throw new Error('Não autorizado, sem token');
  }
});

// Middleware para verificar se o usuário é admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Acesso negado. Apenas administradores.');
  }
};

module.exports = { protect, admin }; 