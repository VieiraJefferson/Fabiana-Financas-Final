const { User, comparePassword } = require('../models/userModel.js');
const asyncHandler = require('express-async-handler'); // Para lidar com erros em rotas assíncronas
const generateToken = require('../utils/generateToken.js');

// @desc    Autenticar usuário & obter token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('=== DEBUG LOGIN ===');
  console.log('Email recebido:', email);
  console.log('Senha recebida:', password);

  const user = await User.findOne({ email });

  console.log('Usuário encontrado:', user ? 'SIM' : 'NÃO');
  if (user) {
    console.log('Senha no banco (primeiros 10 chars):', user.password.substring(0, 10));
    
    const passwordMatch = await comparePassword(password, user.password);
    console.log('Resultado da comparação:', passwordMatch);
    
    if (passwordMatch) {
      console.log('Login bem-sucedido!');
      console.log('📷 Image do usuário:', user.image ? `Base64 com ${user.image.length} chars` : 'SEM IMAGEM');
      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image, // ← Incluindo a imagem no login
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      };
      console.log('📤 Dados enviados no login:', {
        _id: responseData._id,
        name: responseData.name,
        email: responseData.email,
        hasImage: !!responseData.image,
        imageSize: responseData.image ? responseData.image.length : 0,
        isAdmin: responseData.isAdmin
      });
      res.json(responseData);
    } else {
      console.log('Senha incorreta!');
      res.status(401);
      throw new Error('Email ou senha inválidos');
    }
  } else {
    console.log('Usuário não encontrado!');
    res.status(401);
    throw new Error('Email ou senha inválidos');
  }
});

// @desc    Registrar um novo usuário
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Usuário já existe');
  }

  const user = await User.create({
    name,
    email,
    password, // A senha será criptografada pelo middleware no modelo
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image, // ← Incluindo a imagem no registro
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Dados de usuário inválidos');
  }
});

// @desc    Buscar perfil do usuário
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    console.log('🔍 Perfil encontrado:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      hasImage: !!user.image,
      imageUrl: user.image
    });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      role: user.role,
      plan: user.plan,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // req.user é populado pelo middleware de proteção 'protect'
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Imagem deve ser enviada via POST /api/users/profile/photo
    // Não aceitar mais image via PUT para forçar uso do Cloudinary
    if (req.body.image) {
      console.log('❌ Upload de imagem via PUT não permitido. Use POST /api/users/profile/photo');
      res.status(400);
      throw new Error('Para upload de imagem, use a rota POST /api/users/profile/photo');
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.role,
        plan: updatedUser.plan,
      },
      token: generateToken(updatedUser._id), // Retorna um novo token com os dados atualizados
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc    Alterar a senha do usuário
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Por favor, forneça a senha atual e a nova senha.');
  }
  
  const user = await User.findById(req.user.id);

  if (user) {
    const passwordMatch = await comparePassword(currentPassword, user.password);

    if (passwordMatch) {
      user.password = newPassword; // O hook 'pre-save' no modelo cuidará da criptografia
      await user.save();
      res.json({ message: 'Senha alterada com sucesso.' });
    } else {
      res.status(401);
      throw new Error('Senha atual incorreta.');
    }
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado.');
  }
});

// @desc    Alterar a foto de perfil do usuário
// @route   POST /api/users/profile/photo
// @access  Private
const updateUserProfilePhoto = asyncHandler(async (req, res) => {
  try {
    console.log('📷 === UPLOAD CLOUDINARY ===');
    
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhum arquivo de imagem foi enviado.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado.'
      });
    }

    const cloudinary = require('../config/cloudinary');
    
    console.log('☁️ Enviando para Cloudinary...');
    
    // Upload direto para Cloudinary - MUITO MAIS SIMPLES!
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'fabiana-financas/profile-photos',
      transformation: [
        { width: 200, height: 200, crop: 'fill' }, // Redimensiona automaticamente
        { quality: 'auto' } // Otimiza qualidade automaticamente
      ]
    });

    console.log('✅ Upload concluído:', result.secure_url);
    
    // Salvar apenas a URL (muito mais simples!)
    user.image = result.secure_url;
    await user.save();
    
    console.log('✅ URL salva no banco:', result.secure_url);
    
    res.json({
      message: 'Foto de perfil atualizada com sucesso!',
      image: result.secure_url
    });
    
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      message: `Erro no upload: ${error.message}`
    });
  }
});

// @desc    Autenticar/Criar usuário via Google
// @route   POST /api/users/google-auth
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, image, googleId } = req.body;

  console.log('=== DEBUG GOOGLE AUTH ===');
  console.log('Email:', email);
  console.log('Name:', name);
  console.log('GoogleId:', googleId);

  try {
    // Verificar se o usuário já existe
    let user = await User.findOne({ email });

    if (user) {
      // Usuário já existe, fazer login
      console.log('✅ Usuário existente encontrado');
      
      // Atualizar informações do Google se necessário
      if (!user.googleId) {
        user.googleId = googleId;
        user.image = image || user.image;
        await user.save();
        console.log('📝 Atualizadas informações do Google no usuário existente');
      }
    } else {
      // Criar novo usuário
      console.log('🆕 Criando novo usuário via Google');
      
      user = await User.create({
        name,
        email,
        image,
        googleId,
        password: 'google-auth-' + Date.now(), // Senha temporária (não será usada)
        isGoogleUser: true
      });
      
      console.log('✅ Novo usuário criado via Google');
    }

    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };

    console.log('📤 Google Auth - Dados enviados:', {
      _id: responseData._id,
      name: responseData.name,
      email: responseData.email,
      hasImage: !!responseData.image,
      isAdmin: responseData.isAdmin
    });

    res.json(responseData);
  } catch (error) {
    console.error('❌ Erro no Google Auth:', error);
    res.status(500);
    throw new Error('Erro na autenticação com Google');
  }
});

module.exports = { 
  registerUser, 
  authUser, 
  getUserProfile,
  updateUserProfile, 
  updateUserPassword,
  updateUserProfilePhoto,
  googleAuth,
}; 