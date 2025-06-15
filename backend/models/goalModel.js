const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título da meta é obrigatório.'],
      trim: true,
      maxlength: [100, 'O título não pode ter mais de 100 caracteres.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'A descrição não pode ter mais de 500 caracteres.'],
    },
    type: {
      type: String,
      required: [true, 'O tipo da meta é obrigatório.'],
      enum: ['economia', 'investimento', 'divida', 'compra', 'aposentadoria'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'O valor alvo da meta é obrigatório.'],
      min: [0, 'O valor alvo deve ser positivo.'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'O valor atual deve ser positivo.'],
    },
    deadline: {
      type: Date,
      required: [true, 'A data limite da meta é obrigatória.'],
    },
    status: {
      type: String,
      enum: ['ativa', 'concluida', 'pausada'],
      default: 'ativa',
    },
    priority: {
      type: String,
      enum: ['baixa', 'media', 'alta'],
      default: 'media',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    collection: 'goals' // Especifica explicitamente o nome da coleção
  }
);

// Adicionar um índice para melhorar a performance das consultas por usuário
goalSchema.index({ user: 1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = { Goal }; 