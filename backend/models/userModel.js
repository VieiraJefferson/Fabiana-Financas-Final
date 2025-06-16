const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    // Sistema de roles mais robusto
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    // Compatibilidade com o sistema antigo
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Sistema de planos
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    planExpiry: {
      type: Date,
    },
    planFeatures: {
      maxTransactions: { type: Number, default: 100 },
      maxCategories: { type: Number, default: 10 },
      maxGoals: { type: Number, default: 3 },
      hasAdvancedReports: { type: Boolean, default: false },
      hasVideoAccess: { type: Boolean, default: false },
    },
    // Status da conta
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Cria os campos createdAt e updatedAt automaticamente
  }
);

// Middleware que será executado ANTES de salvar o usuário no banco
// para criptografar a senha.
userSchema.pre('save', async function (next) {
  // Só criptografa a senha se ela foi modificada (ou é nova)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Nova função para comparar senhas, não mais atrelada a uma instância
const comparePassword = async function (enteredPassword, hashedPassword) {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = { User, comparePassword }; 