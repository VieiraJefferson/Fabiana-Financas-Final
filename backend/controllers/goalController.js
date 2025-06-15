const asyncHandler = require('express-async-handler');
const { Goal } = require('../models/goalModel');

// @desc    Criar uma nova meta financeira
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  console.log('=== DEBUG CREATE GOAL ===');
  console.log('Body recebido:', req.body);
  console.log('Usuário:', req.user._id);

  const { title, description, type, targetAmount, currentAmount, deadline, priority } = req.body;

  if (!title || !type || !targetAmount || !deadline) {
    console.log('Campos obrigatórios faltando:', { title, type, targetAmount, deadline });
    res.status(400);
    throw new Error('Por favor, preencha todos os campos obrigatórios');
  }

  try {
    console.log('Tentando criar meta com os dados:', {
      title,
      description,
      type,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      priority: priority || 'media',
      user: req.user._id,
    });
    
    const goal = await Goal.create({
      title,
      description,
      type,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      priority: priority || 'media',
      user: req.user._id,
    });

    console.log('Meta criada com sucesso:', goal);

    if (goal) {
      res.status(201).json(goal);
    } else {
      res.status(400);
      throw new Error('Dados da meta inválidos');
    }
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500);
    throw new Error(`Erro ao criar meta: ${error.message}`);
  }
});

// @desc    Obter todas as metas do usuário
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  console.log('=== DEBUG GET GOALS ===');
  console.log('Usuário:', req.user._id);
  
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log(`Encontradas ${goals.length} metas para o usuário`);
    res.status(200).json(goals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500);
    throw new Error(`Erro ao buscar metas: ${error.message}`);
  }
});

// @desc    Obter uma meta específica
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Meta não encontrada');
  }

  // Verificar se a meta pertence ao usuário
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  res.status(200).json(goal);
});

// @desc    Atualizar uma meta
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Meta não encontrada');
  }

  // Verificar se a meta pertence ao usuário
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedGoal);
});

// @desc    Atualizar o progresso de uma meta
// @route   PATCH /api/goals/:id/progress
// @access  Private
const updateGoalProgress = asyncHandler(async (req, res) => {
  const { currentAmount } = req.body;

  if (currentAmount === undefined) {
    res.status(400);
    throw new Error('Por favor, forneça o valor atual');
  }

  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Meta não encontrada');
  }

  // Verificar se a meta pertence ao usuário
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  goal.currentAmount = currentAmount;
  
  // Verificar se a meta foi concluída
  if (currentAmount >= goal.targetAmount && goal.status !== 'concluida') {
    goal.status = 'concluida';
  }

  await goal.save();

  res.status(200).json(goal);
});

// @desc    Excluir uma meta
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Meta não encontrada');
  }

  // Verificar se a meta pertence ao usuário
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  await goal.deleteOne();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
}; 