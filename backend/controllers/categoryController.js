const asyncHandler = require('express-async-handler');
const { Category } = require('../models/categoryModel');

// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Por favor, forneça nome e tipo da categoria');
  }

  // Verificar se a categoria já existe para este usuário
  const categoryExists = await Category.findOne({
    user: req.user._id,
    name: name,
    type: type,
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('Você já tem uma categoria com este nome e tipo');
  }

  const category = await Category.create({
    name,
    type,
    user: req.user._id,
  });

  if (category) {
    res.status(201).json({
      _id: category._id,
      name: category.name,
      type: category.type,
      isDefault: category.isDefault,
    });
  } else {
    res.status(400);
    throw new Error('Dados de categoria inválidos');
  }
});

// @desc    Obter todas as categorias do usuário
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user._id });
  res.status(200).json(categories);
});

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Categoria não encontrada');
  }

  // Verificar se a categoria pertence ao usuário
  if (category.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  // Não permitir atualização de categorias padrão
  if (category.isDefault) {
    res.status(400);
    throw new Error('Categorias padrão não podem ser modificadas');
  }

  const { name, type } = req.body;

  // Verificar se já existe outra categoria com o mesmo nome e tipo
  if (name !== category.name || type !== category.type) {
    const categoryExists = await Category.findOne({
      user: req.user._id,
      name,
      type,
      _id: { $ne: req.params.id }, // Excluir a categoria atual da verificação
    });

    if (categoryExists) {
      res.status(400);
      throw new Error('Você já tem uma categoria com este nome e tipo');
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedCategory);
});

// @desc    Excluir uma categoria
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Categoria não encontrada');
  }

  // Verificar se a categoria pertence ao usuário
  if (category.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  // Não permitir exclusão de categorias padrão
  if (category.isDefault) {
    res.status(400);
    throw new Error('Categorias padrão não podem ser excluídas');
  }

  await category.deleteOne();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
}; 