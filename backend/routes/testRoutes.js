const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel.js');

// Rota de teste sem autenticação
router.get('/public', (req, res) => {
  console.log('=== TEST ROUTE - PUBLIC ===');
  res.json({ message: 'API de teste funcionando - rota pública', timestamp: new Date().toISOString() });
});

// Rota de teste com autenticação
router.get('/protected', protect, (req, res) => {
  console.log('=== TEST ROUTE - PROTECTED ===');
  console.log('User from middleware:', req.user);
  res.json({ 
    message: 'API de teste funcionando - rota protegida', 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    timestamp: new Date().toISOString() 
  });
});

// Rota de teste da conexão MongoDB
router.get('/mongodb', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      message: 'Conectado ao MongoDB com sucesso!',
      userCount: userCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com MongoDB',
      error: error.message
    });
  }
});

// 🔑 ROTA TEMPORÁRIA PARA REDEFINIR SENHA DO ADMIN
router.post('/reset-admin-password', async (req, res) => {
  try {
    console.log('🔄 Procurando usuário admin...');
    
    // Procurar qualquer usuário admin
    const admin = await User.findOne({ 
      $or: [
        { isAdmin: true },
        { role: 'admin' },
        { role: 'super_admin' }
      ]
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum usuário admin encontrado'
      });
    }

    console.log('👤 Admin encontrado:', admin.email);

    // Nova senha: admin123
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    admin.password = hashedPassword;
    admin.isAdmin = true; // Garantir que seja admin
    await admin.save();

    console.log('✅ Senha resetada com sucesso!');

    res.json({
      success: true,
      message: 'Senha do admin resetada com sucesso!',
      loginData: {
        email: admin.email,
        password: newPassword,
        name: admin.name
      }
    });

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// 👥 ROTA PARA LISTAR USUÁRIOS ADMIN
router.get('/list-admins', async (req, res) => {
  try {
    const admins = await User.find({
      $or: [
        { isAdmin: true },
        { role: 'admin' },
        { role: 'super_admin' }
      ]
    }).select('name email isAdmin role createdAt password');

    res.json({
      success: true,
      message: `${admins.length} admin(s) encontrado(s)`,
      admins: admins.map(admin => ({
        ...admin.toObject(),
        passwordHash: admin.password.substring(0, 20) + '...' // Mostrar só os primeiros chars
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar admins',
      error: error.message
    });
  }
});

// 🔍 ROTA PARA TESTAR LOGIN ESPECÍFICO
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Testando login:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'Usuário não encontrado',
        email: email
      });
    }
    
    console.log('👤 Usuário encontrado:', {
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      role: user.role,
      passwordHash: user.password.substring(0, 20) + '...'
    });
    
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Teste de senha:', {
      senhaEnviada: password,
      senhaHashInicio: user.password.substring(0, 20) + '...',
      resultado: passwordMatch
    });
    
    res.json({
      success: true,
      message: 'Teste de login realizado',
      userFound: true,
      passwordMatch: passwordMatch,
      userInfo: {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no teste',
      error: error.message
    });
  }
});

// 🆕 CRIAR NOVO ADMIN DIRETO NO MONGODB
router.post('/create-simple-admin', async (req, res) => {
  try {
    console.log('🆕 Criando novo admin diretamente no MongoDB...');
    
    const email = 'admin@simple.com';
    const password = '123456';
    
    // Remover admin antigo se existir
    await User.deleteMany({ email });
    console.log('🗑️ Admins antigos removidos');
    
    // Hash da senha
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔐 Hash criado:', hashedPassword.substring(0, 30) + '...');
    
    // Inserir diretamente no MongoDB usando insertOne (bypassa middleware)
    const mongoose = require('mongoose');
    const result = await mongoose.connection.db.collection('users').insertOne({
      name: 'Admin Simple',
      email: email,
      password: hashedPassword,
      isAdmin: true,
      role: 'admin',
      plan: 'enterprise',
      planFeatures: {
        maxTransactions: 999999,
        maxCategories: 999999,
        maxGoals: 999999,
        hasAdvancedReports: true,
        hasVideoAccess: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Admin inserido diretamente no MongoDB!');
    
    // Verificar se foi inserido corretamente
    const verifyUser = await User.findOne({ email });
    console.log('✅ Verificação:', {
      found: !!verifyUser,
      email: verifyUser?.email,
      isAdmin: verifyUser?.isAdmin,
      passwordMatch: await bcrypt.compare(password, verifyUser?.password || '')
    });
    
    res.json({
      success: true,
      message: 'Admin criado diretamente no MongoDB!',
      loginData: {
        email: email,
        password: password,
        name: 'Admin Simple'
      },
      verification: {
        inserted: !!result.insertedId,
        canLogin: await bcrypt.compare(password, verifyUser?.password || '')
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar admin',
      error: error.message
    });
  }
});

// 🔧 CORRIGIR DADOS DO ADMIN
router.post('/fix-admin', async (req, res) => {
  try {
    console.log('🔧 Corrigindo dados do admin...');
    
    const email = 'admin@simple.com';
    
    // Encontrar o usuário
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    console.log('👤 Usuário encontrado:', {
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      role: user.role
    });
    
    // Atualizar diretamente no MongoDB
    const mongoose = require('mongoose');
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { email: email },
      { 
        $set: {
          isAdmin: true,
          role: 'admin',
          plan: 'enterprise',
          planFeatures: {
            maxTransactions: 999999,
            maxCategories: 999999,
            maxGoals: 999999,
            hasAdvancedReports: true,
            hasVideoAccess: true
          },
          isActive: true,
          updatedAt: new Date()
        }
      }
    );
    
    // Verificar se foi atualizado
    const updatedUser = await User.findOne({ email });
    
    console.log('✅ Usuário após atualização:', {
      email: updatedUser.email,
      name: updatedUser.name,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      plan: updatedUser.plan
    });
    
    res.json({
      success: true,
      message: 'Admin corrigido com sucesso!',
      loginData: {
        email: email,
        password: '123456',
        name: updatedUser.name
      },
      adminData: {
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.role,
        plan: updatedUser.plan,
        updated: updateResult.modifiedCount > 0
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir admin',
      error: error.message
    });
  }
});

// 🔍 DEBUG SESSÃO ATUAL
router.get('/debug-session', protect, async (req, res) => {
  try {
    console.log('🔍 Debug da sessão atual...');
    
    const currentUser = await User.findById(req.user.id);
    
    res.json({
      success: true,
      message: 'Debug da sessão',
      tokenData: {
        userId: req.user.id,
        userFromToken: req.user
      },
      userFromDatabase: currentUser ? {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        isAdmin: currentUser.isAdmin,
        role: currentUser.role,
        plan: currentUser.plan
      } : null,
      allUsersCount: await User.countDocuments()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no debug',
      error: error.message
    });
  }
});

// 🚀 CRIAR ADMIN DEFINITIVO
router.post('/create-working-admin', async (req, res) => {
  try {
    console.log('🚀 Criando admin definitivo...');
    
    const adminEmail = 'admin@admin.com';
    const adminPassword = '123456';
    
    // 1. Deletar qualquer admin existente
    await User.deleteMany({ 
      $or: [
        { email: adminEmail },
        { email: 'admin@test.com' },
        { email: 'admin@simple.com' },
        { email: 'admin@fabifinancas.com' }
      ]
    });
    console.log('🗑️ Admins antigos removidos');
    
    // 2. Criar hash da senha corretamente
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log('🔐 Senha hashada:', hashedPassword.substring(0, 30) + '...');
    
    // 3. Criar usuário usando Mongoose (com todos os campos necessários)
    const adminUser = new User({
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      role: 'admin',
      plan: 'enterprise',
      planFeatures: {
        maxTransactions: 999999,
        maxCategories: 999999,
        maxGoals: 999999,
        hasAdvancedReports: true,
        hasVideoAccess: true
      },
      isActive: true
    });
    
    // 4. Salvar BYPASSANDO o middleware pre-save que re-hasha a senha
    adminUser.isModified = () => false; // Truque para bypass do middleware
    await adminUser.save();
    
    console.log('✅ Admin salvo no banco');
    
    // 5. Testar login imediatamente
    const testLogin = await bcrypt.compare(adminPassword, adminUser.password);
    console.log('🧪 Teste de login:', testLogin);
    
    // 6. Verificar no banco
    const savedUser = await User.findOne({ email: adminEmail });
    const loginTest = await bcrypt.compare(adminPassword, savedUser.password);
    
    console.log('✅ Verificação final:', {
      userSaved: !!savedUser,
      isAdmin: savedUser?.isAdmin,
      loginWorks: loginTest
    });
    
    res.json({
      success: true,
      message: 'Admin criado e testado com sucesso!',
      loginData: {
        email: adminEmail,
        password: adminPassword,
        name: 'Administrador'
      },
      tests: {
        userCreated: !!adminUser._id,
        passwordHashCorrect: testLogin,
        databaseLoginWorks: loginTest,
        isAdmin: savedUser?.isAdmin
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar admin',
      error: error.message
    });
  }
});

module.exports = router; 