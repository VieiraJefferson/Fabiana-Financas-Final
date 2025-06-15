const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Todas as rotas de categorias são protegidas
router.use(protect);

// Rotas para /api/categories
router.route('/')
  .get(getCategories)
  .post(createCategory);

// Rotas para /api/categories/:id
router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router; 