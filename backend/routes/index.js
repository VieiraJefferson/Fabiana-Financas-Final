const express = require('express');
const router = express.Router();

// Importar rotas
const userRoutes = require('./userRoutes.js');
const adminRoutes = require('./adminRoutes.js');
const budgetRoutes = require('./budgetRoutes.js');
const categoryRoutes = require('./categoryRoutes.js');
const goalRoutes = require('./goalRoutes.js');
const transactionRoutes = require('./transactionRoutes.js');
const paymentRoutes = require('./paymentRoutes.js');

// Configurar rotas
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/budgets', budgetRoutes);
router.use('/categories', categoryRoutes);
router.use('/goals', goalRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de informações da API
router.get('/', (req, res) => {
  res.json({
    name: 'Fabiana Finanças API',
    version: '2.0.0',
    description: 'API robusta para sistema de finanças pessoais',
    endpoints: {
      users: '/api/users',
      admin: '/api/admin',
      budgets: '/api/budgets',
      categories: '/api/categories',
      goals: '/api/goals',
      transactions: '/api/transactions',
      payments: '/api/payments'
    },
    documentation: '/api/docs',
    health: '/api/health'
  });
});

module.exports = router;
