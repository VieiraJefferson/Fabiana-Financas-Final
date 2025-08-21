require('dotenv').config();
const connectDB = require('./config/db.js');
const { User } = require('./models/userModel.js');

const resetAdmin = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🗑️ Deletando usuários admin existentes...');
    await User.deleteMany({ email: { $in: ['admin@test.com', 'admin@admin.com'] } });
    console.log('✅ Usuários admin deletados');
    
    console.log('🆕 Criando novos usuários admin...');
    
    // Criar admin@test.com
    const admin1 = new User({
      name: 'Admin Teste',
      email: 'admin@test.com',
      password: 'admin123',
      isAdmin: true,
      role: 'admin'
    });
    await admin1.save();
    console.log('✅ admin@test.com criado');
    
    // Criar admin@admin.com
    const admin2 = new User({
      name: 'Admin Principal',
      email: 'admin@admin.com',
      password: 'admin123',
      isAdmin: true,
      role: 'admin'
    });
    await admin2.save();
    console.log('✅ admin@admin.com criado');
    
    console.log('\n📋 DADOS DE LOGIN:');
    console.log('Email: admin@test.com');
    console.log('Senha: admin123');
    console.log('---');
    console.log('Email: admin@admin.com');
    console.log('Senha: admin123');
    console.log('\n🚀 Usuários admin recriados com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

resetAdmin();
