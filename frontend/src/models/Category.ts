import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'receita' | 'despesa';
  user: mongoose.Schema.Types.ObjectId;
  isDefault: boolean; // Para categorias padrão que não podem ser excluídas
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
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
CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 