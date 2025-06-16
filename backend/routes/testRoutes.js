const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Rota de teste sem autenticação
router.get('/public', (req, res) => {
  console.log('=== TEST ROUTE - PUBLIC ===');
  res.json({ message: 'API de teste funcionando - rota pública', timestamp: new Date().toISOString() });
});

// Rota de teste com autenticação
router.get('/protected', protect, (req, res) => {
  console.log('=== TEST ROUTE - PROTECTED ===');
  console.log('User from middleware:', req.user);
  res.json({ 
    message: 'API de teste funcionando - rota protegida', 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    timestamp: new Date().toISOString() 
  });
});

// Rota para testar conexão com MongoDB e variáveis de ambiente
router.get('/mongodb', protect, async (req, res) => {
  try {
    console.log('=== TESTE MONGODB ===');
    console.log('JWT_SECRET existe:', !!process.env.JWT_SECRET);
    console.log('MONGO_URI existe:', !!process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const mongoose = require('mongoose');
    console.log('Estado da conexão MongoDB:', mongoose.connection.readyState);
    
    // Testar uma consulta simples
    const { Category } = require('../models/categoryModel');
    const testQuery = await Category.find({ user: req.user._id }).limit(1);
    
    res.json({
      mongoState: mongoose.connection.readyState,
      user: req.user._id,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasMongoUri: !!process.env.MONGO_URI,
      testQueryResult: testQuery.length,
      success: true
    });
  } catch (error) {
    console.error('Erro no teste MongoDB:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 