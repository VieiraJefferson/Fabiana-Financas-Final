const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Índice composto para garantir que não haja orçamentos duplicados para a mesma categoria/mês/ano/usuário
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Índice para consultas por usuário e período
budgetSchema.index({ user: 1, year: 1, month: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 