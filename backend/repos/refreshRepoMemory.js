// Repositório em memória para testes rápidos
// Em produção, use o refreshRepo.js com MongoDB

const store = new Map(); // jti -> { userId, revoked: false, metadata }

class RefreshTokenMemoryRepo {
  async save(jti, userId, metadata = {}) {
    const tokenData = {
      userId,
      revoked: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
      ...metadata
    };
    
    store.set(jti, tokenData);
    return tokenData;
  }

  async revoke(jti) {
    const token = store.get(jti);
    if (token) {
      token.revoked = true;
      return true;
    }
    return false;
  }

  async isValid(jti, userId) {
    const token = store.get(jti);
    if (!token) return false;
    
    const now = new Date();
    return !token.revoked && 
           token.expiresAt > now && 
           String(token.userId) === String(userId);
  }

  async findByJTI(jti) {
    return store.get(jti) || null;
  }

  async findValidByUserId(userId) {
    const validTokens = [];
    const now = new Date();
    
    for (const [jti, token] of store.entries()) {
      if (!token.revoked && 
          token.expiresAt > now && 
          String(token.userId) === String(userId)) {
        validTokens.push({ jti, ...token });
      }
    }
    
    return validTokens;
  }

  async revokeAllByUserId(userId) {
    let count = 0;
    
    for (const [jti, token] of store.entries()) {
      if (String(token.userId) === String(userId) && !token.revoked) {
        token.revoked = true;
        count++;
      }
    }
    
    return { modifiedCount: count };
  }

  async cleanExpired() {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [jti, token] of store.entries()) {
      if (token.expiresAt < now) {
        store.delete(jti);
        deletedCount++;
      }
    }
    
    return { deletedCount };
  }

  async getStats() {
    const now = new Date();
    let total = 0, valid = 0, revoked = 0, expired = 0;
    
    for (const token of store.values()) {
      total++;
      if (token.revoked) {
        revoked++;
      } else if (token.expiresAt < now) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total,
      valid,
      revoked,
      expired,
      activePercentage: total > 0 ? Math.round((valid / total) * 100) : 0
    };
  }

  async findWithAudit(userId, limit = 10) {
    const tokens = await this.findValidByUserId(userId);
    return tokens.slice(0, limit).map(token => ({
      jti: token.jti,
      isRevoked: token.revoked,
      expiresAt: token.expiresAt,
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
      deviceId: token.deviceId,
      createdAt: token.createdAt
    }));
  }

  // Método para limpar todos os dados (útil para testes)
  async clearAll() {
    store.clear();
  }

  // Método para obter tamanho do store (útil para debug)
  getSize() {
    return store.size;
  }
}

module.exports = new RefreshTokenMemoryRepo();
