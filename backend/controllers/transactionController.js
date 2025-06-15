const Transaction = require('../models/transactionModel.js');
const asyncHandler = require('express-async-handler');

// @desc    Criar nova transação
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, category, date, notes } = req.body;

  // Validações básicas
  if (!type || !amount || !description || !category) {
    res.status(400);
    throw new Error('Tipo, valor, descrição e categoria são obrigatórios');
  }

  if (amount <= 0) {
    res.status(400);
    throw new Error('O valor deve ser maior que zero');
  }

  const transaction = await Transaction.create({
    user: req.user.id, // Vem do middleware de autenticação
    type,
    amount,
    description,
    category,
    date: date || new Date(),
    notes,
  });

  res.status(201).json(transaction);
});

// @desc    Obter todas as transações do usuário
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;

  // Construir filtros
  const filter = { user: req.user.id };

  if (type && ['receita', 'despesa'].includes(type)) {
    filter.type = type;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Paginação
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find(filter)
    .sort({ date: -1 }) // Mais recentes primeiro
    .limit(limit * 1)
    .skip(skip);

  const total = await Transaction.countDocuments(filter);

  res.json({
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
});

// @desc    Obter transação por ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transação não encontrada');
  }

  // Verificar se a transação pertence ao usuário
  if (transaction.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Não autorizado a acessar esta transação');
  }

  res.json(transaction);
});

// @desc    Atualizar transação
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, category, date, notes } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transação não encontrada');
  }

  // Verificar se a transação pertence ao usuário
  if (transaction.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Não autorizado a atualizar esta transação');
  }

  // Validações
  if (amount && amount <= 0) {
    res.status(400);
    throw new Error('O valor deve ser maior que zero');
  }

  // Atualizar campos
  transaction.type = type || transaction.type;
  transaction.amount = amount || transaction.amount;
  transaction.description = description || transaction.description;
  transaction.category = category || transaction.category;
  transaction.date = date || transaction.date;
  transaction.notes = notes !== undefined ? notes : transaction.notes;

  const updatedTransaction = await transaction.save();

  res.json(updatedTransaction);
});

// @desc    Deletar transação
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transação não encontrada');
  }

  // Verificar se a transação pertence ao usuário
  if (transaction.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Não autorizado a deletar esta transação');
  }

  await Transaction.findByIdAndDelete(req.params.id);

  res.json({ message: 'Transação removida com sucesso' });
});

// @desc    Obter todas as categorias distintas do usuário
// @route   GET /api/transactions/categories
// @access  Private
const getTransactionCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', { user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500);
    throw new Error('Erro ao buscar as categorias');
  }
});

// @desc    Obter resumo financeiro do usuário
// @route   GET /api/transactions/summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Filtro de data
  const dateFilter = { user: req.user.id };
  if (startDate || endDate) {
    dateFilter.date = {};
    if (startDate) dateFilter.date.$gte = new Date(startDate);
    if (endDate) dateFilter.date.$lte = new Date(endDate);
  }

  // Agregação para calcular totais
  const summary = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Organizar resultado
  const result = {
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesReceitas: 0,
    transacoesDespesas: 0,
  };

  summary.forEach((item) => {
    if (item._id === 'receita') {
      result.totalReceitas = item.total;
      result.transacoesReceitas = item.count;
    } else if (item._id === 'despesa') {
      result.totalDespesas = item.total;
      result.transacoesDespesas = item.count;
    }
  });

  result.saldo = result.totalReceitas - result.totalDespesas;

  res.json(result);
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getTransactionCategories,
}; 