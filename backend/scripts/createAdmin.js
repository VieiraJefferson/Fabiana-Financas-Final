require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db.js');
const { User } = require('../models/userModel.js');

const createAdmin = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    console.log('🔍 MONGO_URI:', process.env.MONGO_URI);
    await connectDB();

    // Dados dos admins
    const admins = [
      {
        name: 'Admin Teste',
        email: 'admin@test.com',
        password: 'admin123',
        isAdmin: true,
        role: 'admin'
      },
      {
        name: 'Admin Principal',
        email: 'admin@admin.com',
        password: 'admin123',
        isAdmin: true,
        role: 'admin'
      }
    ];

    for (const adminData of admins) {
      console.log(`🔍 Verificando se admin ${adminData.email} já existe...`);
      
      // Verificar se já existe
      const existingAdmin = await User.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log(`📝 Admin ${adminData.email} já existe, atualizando senha...`);
        
        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // Atualizar usuário existente
        existingAdmin.password = hashedPassword;
        existingAdmin.isAdmin = true;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        
        console.log(`✅ Senha do admin ${adminData.email} atualizada!`);
      } else {
        console.log(`🆕 Criando novo admin ${adminData.email}...`);
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // Criar novo admin
        const newAdmin = new User({
          ...adminData,
          password: hashedPassword
        });
        
        await newAdmin.save();
        console.log(`✅ Admin ${adminData.email} criado com sucesso!`);
      }
    }

    console.log('\n📋 DADOS DE LOGIN:');
    console.log('Email: admin@test.com');
    console.log('Senha: admin123');
    console.log('---');
    console.log('Email: admin@admin.com');
    console.log('Senha: admin123');
    console.log('\n🚀 Você pode fazer login agora!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

createAdmin(); 