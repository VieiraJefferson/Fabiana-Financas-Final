const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0 // TTL automático baseado em expiresAt
  },
  // Informações adicionais para auditoria
  userAgent: String,
  ipAddress: String,
  deviceId: String
}, {
  timestamps: true
});

// Índices compostos para performance
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ jti: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método para revogar token
refreshTokenSchema.methods.revoke = function() {
  this.isRevoked = true;
  return this.save();
};

// Método para verificar se token é válido
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Método estático para buscar token válido por JTI
refreshTokenSchema.statics.findValidByJTI = function(jti) {
  return this.findOne({
    jti,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

// Método estático para buscar todos os tokens válidos de um usuário
refreshTokenSchema.statics.findValidByUserId = function(userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

// Método estático para revogar todos os tokens de um usuário
refreshTokenSchema.statics.revokeAllByUserId = function(userId) {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

// Método estático para limpar tokens expirados
refreshTokenSchema.statics.cleanExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Middleware para limpar tokens expirados automaticamente
refreshTokenSchema.pre('save', function(next) {
  if (this.isModified('expiresAt')) {
    // Calcular TTL para o índice
    const ttl = Math.floor((this.expiresAt - new Date()) / 1000);
    if (ttl > 0) {
      this.createdAt = new Date(Date.now() + (ttl * 1000));
    }
  }
  next();
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
