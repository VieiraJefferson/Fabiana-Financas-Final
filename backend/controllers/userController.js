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
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
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
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Dados de usuário inválidos');
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

    // A lógica de alteração de senha será tratada separadamente.
    // Por enquanto, esta rota atualiza apenas nome e e-mail.

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
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
  const user = await User.findById(req.user.id);

  if (user) {
    if (req.file) {
      // O caminho do arquivo é adicionado pelo middleware multer
      user.image = `/${req.file.path.replace(/\\/g, "/")}`; // Garante barras compatíveis com URL
      const updatedUser = await user.save();
      res.json({
        message: 'Foto de perfil atualizada com sucesso!',
        image: updatedUser.image,
      });
    } else {
      res.status(400);
      throw new Error('Nenhum arquivo de imagem foi enviado.');
    }
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado.');
  }
});

module.exports = { 
  registerUser, 
  authUser, 
  updateUserProfile, 
  updateUserPassword,
  updateUserProfilePhoto,
}; 