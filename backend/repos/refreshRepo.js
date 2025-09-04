const RefreshToken = require('../models/refreshTokenModel.js');

class RefreshTokenRepository {
  // Salvar novo refresh token
  async save(jti, userId, metadata = {}) {
    try {
      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 14); // 14 dias
      
      const refreshToken = await RefreshToken.create({
        jti,
        userId,
        token: metadata.token || 'stored', // O token real fica no cookie
        expiresAt: refreshExpiresAt,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        deviceId: metadata.deviceId
      });
      
      return refreshToken;
    } catch (error) {
      console.error('Erro ao salvar refresh token:', error);
      throw new Error('Falha ao salvar refresh token');
    }
  }

  // Verificar se refresh token é válido
  async isValid(jti, userId) {
    try {
      const token = await RefreshToken.findValidByJTI(jti);
      
      if (!token) {
        return false;
      }
      
      // Verificar se pertence ao usuário correto
      if (token.userId.toString() !== userId) {
        return false;
      }
      
      return token.isValid();
    } catch (error) {
      console.error('Erro ao verificar validade do refresh token:', error);
      return false;
    }
  }

  // Revogar refresh token
  async revoke(jti) {
    try {
      const result = await RefreshToken.findOneAndUpdate(
        { jti },
        { isRevoked: true },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Erro ao revogar refresh token:', error);
      return false;
    }
  }

  // Revogar todos os tokens de um usuário
  async revokeAllByUserId(userId) {
    try {
      const result = await RefreshToken.revokeAllByUserId(userId);
      return result.modifiedCount || 0;
    } catch (error) {
      console.error('Erro ao revogar todos os tokens do usuário:', error);
      return 0;
    }
  }

  // Buscar token por JTI
  async findByJTI(jti) {
    try {
      return await RefreshToken.findOne({ jti });
    } catch (error) {
      console.error('Erro ao buscar refresh token por JTI:', error);
      return null;
    }
  }

  // Buscar tokens válidos de um usuário
  async findValidByUserId(userId) {
    try {
      return await RefreshToken.findValidByUserId(userId);
    } catch (error) {
      console.error('Erro ao buscar tokens válidos do usuário:', error);
      return [];
    }
  }

  // Contar tokens ativos de um usuário
  async countActiveByUserId(userId) {
    try {
      return await RefreshToken.countDocuments({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });
    } catch (error) {
      console.error('Erro ao contar tokens ativos do usuário:', error);
      return 0;
    }
  }

  // Limpar tokens expirados
  async cleanExpired() {
    try {
      const result = await RefreshToken.cleanExpired();
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      return 0;
    }
  }

  // Obter estatísticas dos tokens
  async getStats() {
    try {
      const total = await RefreshToken.countDocuments();
      const valid = await RefreshToken.countDocuments({
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });
      const revoked = await RefreshToken.countDocuments({ isRevoked: true });
      const expired = await RefreshToken.countDocuments({
        expiresAt: { $lt: new Date() }
      });
      
      return {
        total,
        valid,
        revoked,
        expired,
        activePercentage: total > 0 ? Math.round((valid / total) * 100) : 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas dos tokens:', error);
      return {
        total: 0,
        valid: 0,
        revoked: 0,
        expired: 0,
        activePercentage: 0
      };
    }
  }

  // Buscar tokens com informações de auditoria
  async findWithAudit(userId, limit = 10) {
    try {
      return await RefreshToken.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('jti isRevoked expiresAt userAgent ipAddress deviceId createdAt');
    } catch (error) {
      console.error('Erro ao buscar tokens com auditoria:', error);
      return [];
    }
  }
}

// Exportar instância singleton
module.exports = new RefreshTokenRepository();
