const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getTransactionCategories,
} = require('../controllers/transactionController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Aplicar middleware de proteção a todas as rotas
router.use(protect);

// Rota para obter categorias
router.route('/categories')
  .get(getTransactionCategories); // GET /api/transactions/categories

// Rotas para /api/transactions
router.route('/')
  .get(getTransactions)     // GET /api/transactions
  .post(createTransaction); // POST /api/transactions

router.route('/summary')
  .get(getFinancialSummary); // GET /api/transactions/summary

router.route('/:id')
  .get(getTransactionById)    // GET /api/transactions/:id
  .put(updateTransaction)     // PUT /api/transactions/:id
  .delete(deleteTransaction); // DELETE /api/transactions/:id

module.exports = router; 