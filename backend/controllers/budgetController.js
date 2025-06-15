const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');
const asyncHandler = require('express-async-handler');

// @desc    Criar novo orçamento
// @route   POST /api/budgets
// @access  Private
const createBudget = asyncHandler(async (req, res) => {
  const { category, amount, month, year, notes } = req.body;

  if (!category || !amount || !month || !year) {
    res.status(400);
    throw new Error('Categoria, valor, mês e ano são obrigatórios');
  }

  if (amount <= 0) {
    res.status(400);
    throw new Error('O valor deve ser maior que zero');
  }

  // Verificar se já existe orçamento para esta categoria/mês/ano
  const existingBudget = await Budget.findOne({
    user: req.user.id,
    category,
    month,
    year,
  });

  if (existingBudget) {
    res.status(400);
    throw new Error('Já existe um orçamento para esta categoria neste período');
  }

  const budget = await Budget.create({
    user: req.user.id,
    category,
    amount,
    month,
    year,
    notes,
  });

  res.status(201).json(budget);
});

// @desc    Obter todos os orçamentos do usuário
// @route   GET /api/budgets
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  
  const filter = { user: req.user.id };
  
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);

  const budgets = await Budget.find(filter).sort({ category: 1 });
  
  res.json(budgets);
});

// @desc    Obter orçamento por ID
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Orçamento não encontrado');
  }

  // Verificar se o orçamento pertence ao usuário
  if (budget.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  res.json(budget);
});

// @desc    Atualizar orçamento
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = asyncHandler(async (req, res) => {
  const { category, amount, month, year, notes, isActive } = req.body;

  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Orçamento não encontrado');
  }

  // Verificar se o orçamento pertence ao usuário
  if (budget.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  // Se mudou categoria, mês ou ano, verificar duplicatas
  if (
    (category && category !== budget.category) ||
    (month && month !== budget.month) ||
    (year && year !== budget.year)
  ) {
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category: category || budget.category,
      month: month || budget.month,
      year: year || budget.year,
      _id: { $ne: budget._id },
    });

    if (existingBudget) {
      res.status(400);
      throw new Error('Já existe um orçamento para esta categoria neste período');
    }
  }

  budget.category = category || budget.category;
  budget.amount = amount || budget.amount;
  budget.month = month || budget.month;
  budget.year = year || budget.year;
  budget.notes = notes !== undefined ? notes : budget.notes;
  budget.isActive = isActive !== undefined ? isActive : budget.isActive;

  const updatedBudget = await budget.save();
  res.json(updatedBudget);
});

// @desc    Deletar orçamento
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Orçamento não encontrado');
  }

  // Verificar se o orçamento pertence ao usuário
  if (budget.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  await Budget.findByIdAndDelete(req.params.id);
  res.json({ message: 'Orçamento removido' });
});

// @desc    Obter resumo de orçamentos vs gastos
// @route   GET /api/budgets/summary
// @access  Private
const getBudgetSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  // Buscar orçamentos do período
  const budgets = await Budget.find({
    user: req.user.id,
    month: currentMonth,
    year: currentYear,
    isActive: true,
  });

  // Buscar gastos do período
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0);

  const expenses = await Transaction.find({
    user: req.user.id,
    type: 'despesa',
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // Agrupar gastos por categoria
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Calcular resumo
  const summary = budgets.map(budget => {
    const spent = expensesByCategory[budget.category] || 0;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      _id: budget._id,
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      status: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe',
      notes: budget.notes,
    };
  });

  // Calcular totais
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  res.json({
    month: currentMonth,
    year: currentYear,
    categories: summary,
    totals: {
      budgeted: totalBudgeted,
      spent: totalSpent,
      remaining: totalRemaining,
      percentage: Math.min(overallPercentage, 100),
      status: overallPercentage >= 100 ? 'danger' : overallPercentage >= 80 ? 'warning' : 'safe',
    },
  });
});

// @desc    Copiar orçamentos do mês anterior
// @route   POST /api/budgets/copy-previous
// @access  Private
const copyPreviousBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    res.status(400);
    throw new Error('Mês e ano são obrigatórios');
  }

  // Calcular mês anterior
  let prevMonth = month - 1;
  let prevYear = year;
  
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  // Buscar orçamentos do mês anterior
  const previousBudgets = await Budget.find({
    user: req.user.id,
    month: prevMonth,
    year: prevYear,
    isActive: true,
  });

  if (previousBudgets.length === 0) {
    res.status(404);
    throw new Error('Nenhum orçamento encontrado no mês anterior');
  }

  // Verificar se já existem orçamentos no mês atual
  const existingBudgets = await Budget.find({
    user: req.user.id,
    month,
    year,
  });

  if (existingBudgets.length > 0) {
    res.status(400);
    throw new Error('Já existem orçamentos para este período');
  }

  // Copiar orçamentos
  const newBudgets = previousBudgets.map(budget => ({
    user: req.user.id,
    category: budget.category,
    amount: budget.amount,
    month,
    year,
    notes: budget.notes,
    isActive: true,
  }));

  const createdBudgets = await Budget.insertMany(newBudgets);
  
  res.status(201).json({
    message: `${createdBudgets.length} orçamentos copiados com sucesso`,
    budgets: createdBudgets,
  });
});

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  copyPreviousBudgets,
}; 