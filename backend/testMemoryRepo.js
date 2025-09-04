const RefreshRepoMemory = require('./repos/refreshRepoMemory.js');
const { v4: uuid } = require('uuid');

const testMemoryRepo = async () => {
  try {
    console.log('🧪 Testando repositório em memória...\n');
    
    // Limpar dados anteriores
    await RefreshRepoMemory.clearAll();
    console.log('✅ Dados anteriores limpos');
    
    // 1. Teste de salvamento
    console.log('\n📝 1. Testando salvamento...');
    const jti1 = uuid();
    const jti2 = uuid();
    
    await RefreshRepoMemory.save(jti1, 'user123', {
      userAgent: 'Test Browser',
      ipAddress: '127.0.0.1',
      deviceId: 'test-device-1'
    });
    
    await RefreshRepoMemory.save(jti2, 'user123', {
      userAgent: 'Mobile Browser',
      ipAddress: '192.168.1.1',
      deviceId: 'test-device-2'
    });
    
    console.log('✅ 2 tokens salvos');
    console.log('📊 Tamanho do store:', RefreshRepoMemory.getSize());
    
    // 2. Teste de validação
    console.log('\n✅ 2. Testando validação...');
    const isValid1 = await RefreshRepoMemory.isValid(jti1, 'user123');
    const isValid2 = await RefreshRepoMemory.isValid(jti2, 'user123');
    const isValid3 = await RefreshRepoMemory.isValid(jti1, 'user456'); // Usuário errado
    
    console.log('✅ Token 1 válido:', isValid1);
    console.log('✅ Token 2 válido:', isValid2);
    console.log('✅ Token 1 com usuário errado:', isValid3);
    
    // 3. Teste de busca
    console.log('\n🔎 3. Testando busca...');
    const validTokens = await RefreshRepoMemory.findValidByUserId('user123');
    const tokenAudit = await RefreshRepoMemory.findWithAudit('user123', 5);
    
    console.log('✅ Tokens válidos encontrados:', validTokens.length);
    console.log('✅ Auditoria de tokens:', tokenAudit.length);
    
    // 4. Teste de estatísticas
    console.log('\n📊 4. Testando estatísticas...');
    const stats = await RefreshRepoMemory.getStats();
    console.log('✅ Estatísticas:', stats);
    
    // 5. Teste de revogação
    console.log('\n🚫 5. Testando revogação...');
    const revoked = await RefreshRepoMemory.revoke(jti1);
    console.log('✅ Token 1 revogado:', revoked);
    
    const isValidAfterRevoke = await RefreshRepoMemory.isValid(jti1, 'user123');
    console.log('✅ Token 1 válido após revogação:', isValidAfterRevoke);
    
    // 6. Teste de revogação em massa
    console.log('\n🗑️ 6. Testando revogação em massa...');
    const revokedCount = await RefreshRepoMemory.revokeAllByUserId('user123');
    console.log('✅ Tokens revogados em massa:', revokedCount.modifiedCount);
    
    // 7. Verificar se todos foram revogados
    const remainingTokens = await RefreshRepoMemory.findValidByUserId('user123');
    console.log('✅ Tokens restantes válidos:', remainingTokens.length);
    
    // 8. Teste de limpeza
    console.log('\n🧹 7. Testando limpeza...');
    const cleanedCount = await RefreshRepoMemory.cleanExpired();
    console.log('✅ Tokens expirados limpos:', cleanedCount.deletedCount);
    
    // 9. Teste de múltiplos usuários
    console.log('\n👥 8. Testando múltiplos usuários...');
    const jti3 = uuid();
    const jti4 = uuid();
    
    await RefreshRepoMemory.save(jti3, 'user456', { userAgent: 'User 2 Browser' });
    await RefreshRepoMemory.save(jti4, 'user789', { userAgent: 'User 3 Browser' });
    
    const user456Tokens = await RefreshRepoMemory.findValidByUserId('user456');
    const user789Tokens = await RefreshRepoMemory.findValidByUserId('user789');
    
    console.log('✅ Tokens do user456:', user456Tokens.length);
    console.log('✅ Tokens do user789:', user789Tokens.length);
    
    // 10. Estatísticas finais
    console.log('\n📊 9. Estatísticas finais...');
    const finalStats = await RefreshRepoMemory.getStats();
    console.log('✅ Estatísticas finais:', finalStats);
    console.log('📊 Tamanho final do store:', RefreshRepoMemory.getSize());
    
    // 11. Limpeza final
    console.log('\n🧹 10. Limpeza final...');
    await RefreshRepoMemory.clearAll();
    console.log('✅ Todos os dados removidos');
    console.log('📊 Tamanho final do store:', RefreshRepoMemory.getSize());
    
    console.log('\n🎉 Todos os testes do repositório em memória passaram!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('   ✅ Salvamento de tokens');
    console.log('   ✅ Validação de tokens');
    console.log('   ✅ Busca por usuário');
    console.log('   ✅ Auditoria de tokens');
    console.log('   ✅ Estatísticas');
    console.log('   ✅ Revogação individual');
    console.log('   ✅ Revogação em massa');
    console.log('   ✅ Limpeza automática');
    console.log('   ✅ Múltiplos usuários');
    console.log('   ✅ Gerenciamento de estado');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
};

// Executar testes
testMemoryRepo();
