require('dotenv').config();
const connectDB = require('../config/db.js');
const RefreshToken = require('../models/refreshTokenModel.js');

const cleanupExpiredTokens = async () => {
  try {
    console.log('🧹 Iniciando limpeza de tokens expirados...');
    
    // Conectar ao banco
    await connectDB();
    
    // Limpar tokens expirados
    const result = await RefreshToken.cleanExpired();
    
    console.log(`✅ Limpeza concluída! ${result.deletedCount || 0} tokens expirados removidos.`);
    
    // Verificar estatísticas
    const totalTokens = await RefreshToken.countDocuments();
    const validTokens = await RefreshToken.countDocuments({ isRevoked: false, expiresAt: { $gt: new Date() } });
    const revokedTokens = await RefreshToken.countDocuments({ isRevoked: true });
    
    console.log('\n📊 Estatísticas dos tokens:');
    console.log(`   Total: ${totalTokens}`);
    console.log(`   Válidos: ${validTokens}`);
    console.log(`   Revogados: ${revokedTokens}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
    process.exit(1);
  }
};

// Executar limpeza
cleanupExpiredTokens();
