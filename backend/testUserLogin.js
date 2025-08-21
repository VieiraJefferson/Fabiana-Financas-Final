require('dotenv').config();
const connectDB = require('./config/db.js');
const { User, comparePassword } = require('./models/userModel.js');

const testUserLogin = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    // Listar todos os usuários para ver quais existem
    console.log('📋 Listando todos os usuários:');
    const users = await User.find({}, 'name email isAdmin role');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Admin: ${user.isAdmin} - Role: ${user.role}`);
    });
    
    // Perguntar qual usuário testar
    console.log('\n🧪 Para testar um usuário específico, me diga o email:');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

testUserLogin();
