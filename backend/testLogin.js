require('dotenv').config();
const connectDB = require('./config/db.js');
const { User, comparePassword } = require('./models/userModel.js');

const testLogin = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🧪 Testando login diretamente no banco...');
    
    // Buscar usuário
    const user = await User.findOne({ email: 'admin@test.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role
    });
    
    // Testar senha
    const passwordMatch = await comparePassword('admin123', user.password);
    console.log('🔐 Senha correta:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login funcionando perfeitamente!');
    } else {
      console.log('❌ Senha incorreta');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
};

testLogin();
