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

module.exports = router; 