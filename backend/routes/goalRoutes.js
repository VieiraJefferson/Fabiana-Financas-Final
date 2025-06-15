const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

// Rota de teste que não requer autenticação
router.get('/test', (req, res) => {
  console.log('Rota de teste de metas acessada');
  res.status(200).json({ message: 'API de metas está funcionando!' });
});

// Todas as rotas abaixo são protegidas
router.use(protect);

// Rotas para /api/goals
router.route('/')
  .get(getGoals)
  .post(createGoal);

// Rotas para /api/goals/:id
router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

// Rota para atualizar o progresso de uma meta
router.route('/:id/progress')
  .patch(updateGoalProgress);

module.exports = router; 