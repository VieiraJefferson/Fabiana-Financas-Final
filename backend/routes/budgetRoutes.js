const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  copyPreviousBudgets,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(protect);

// Rotas principais
router.route('/')
  .get(getBudgets)
  .post(createBudget);

// Rota para resumo de orçamentos
router.route('/summary')
  .get(getBudgetSummary);

// Rota para copiar orçamentos do mês anterior
router.route('/copy-previous')
  .post(copyPreviousBudgets);

// Rotas específicas por ID
router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router; 