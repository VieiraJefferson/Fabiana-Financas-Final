const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel.js');

// Middleware para verificar se o usuário é admin
const requireAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  // Verificar se é admin ou super_admin
  if (user.role === 'admin' || user.role === 'super_admin' || user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Acesso negado. Permissões de administrador necessárias.');
  }
});

// Middleware para verificar se o usuário é super admin
const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }

  if (user.role === 'super_admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Acesso negado. Permissões de super administrador necessárias.');
  }
});

// Middleware para verificar plano do usuário
const requirePlan = (requiredPlan) => {
  return asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('Usuário não encontrado');
    }

    // Hierarquia de planos: free < premium < enterprise
    const planHierarchy = { free: 0, premium: 1, enterprise: 2 };
    
    if (planHierarchy[user.plan] >= planHierarchy[requiredPlan]) {
      next();
    } else {
      res.status(403);
      throw new Error(`Plano ${requiredPlan} ou superior necessário.`);
    }
  });
};

// Middleware para verificar limites do plano
const checkPlanLimits = (resource) => {
  return asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404);
      throw new Error('Usuário não encontrado');
    }

    // Aqui você pode implementar a lógica de verificação de limites
    // baseada no resource (transactions, categories, goals, etc.)
    
    next();
  });
};

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  requirePlan,
  checkPlanLimits
}; 