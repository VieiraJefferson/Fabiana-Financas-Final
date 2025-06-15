const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Conectar ao banco
mongoose.connect(process.env.MONGO_URI);

// Schema simples para o usuário
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
});

const User = mongoose.model('User', userSchema);

async function fixAdminPassword() {
  try {
    console.log('Procurando usuário admin...');
    
    // Encontrar o usuário admin
    const admin = await User.findOne({ email: 'admin@fabifinancas.com' });
    
    if (!admin) {
      console.log('Usuário admin não encontrado!');
      return;
    }
    
    console.log('Usuário admin encontrado:', admin.name);
    console.log('Senha atual (primeiros 10 chars):', admin.password.substring(0, 10));
    
    // Criptografar a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);
    
    console.log('Nova senha criptografada (primeiros 10 chars):', hashedPassword.substring(0, 10));
    
    // Atualizar no banco
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Senha do admin atualizada com sucesso!');
    
    // Testar a comparação
    const isMatch = await bcrypt.compare('adminpassword', hashedPassword);
    console.log('✅ Teste de comparação:', isMatch ? 'SUCESSO' : 'FALHA');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

fixAdminPassword(); 