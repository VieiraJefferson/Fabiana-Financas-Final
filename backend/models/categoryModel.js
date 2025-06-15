const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome da categoria é obrigatório.'],
      trim: true,
      maxlength: [50, 'O nome da categoria não pode ter mais de 50 caracteres.'],
    },
    type: {
      type: String,
      required: [true, 'O tipo da categoria (receita ou despesa) é obrigatório.'],
      enum: ['receita', 'despesa'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Índice para garantir que um usuário não tenha categorias com o mesmo nome e tipo
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = { Category }; 