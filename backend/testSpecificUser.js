require('dotenv').config();
const connectDB = require('./config/db.js');
const { User, comparePassword } = require('./models/userModel.js');

const testSpecificUser = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🔍 Buscando usuário jeff1@gmail.com...');
    const user = await User.findOne({ email: 'jeff1@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuário jeff1@gmail.com não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      passwordLength: user.password.length,
      passwordStart: user.password.substring(0, 10) + '...'
    });
    
    // Testar com a senha correta
    console.log('\n🧪 Testando senha...');
    const passwordMatch = await comparePassword('123456', user.password);
    console.log('🔐 Senha correta:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login funcionando perfeitamente!');
    } else {
      console.log('❌ Senha incorreta');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

testSpecificUser();
