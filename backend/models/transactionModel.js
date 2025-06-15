const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referência ao modelo User
    },
    type: {
      type: String,
      required: true,
      enum: ['receita', 'despesa'], // Só pode ser receita ou despesa
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Valor mínimo de 1 centavo
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // Cria createdAt e updatedAt automaticamente
  }
);

// Índices para melhorar performance das consultas
transactionSchema.index({ user: 1, date: -1 }); // Buscar por usuário e data
transactionSchema.index({ user: 1, type: 1 }); // Buscar por usuário e tipo

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 