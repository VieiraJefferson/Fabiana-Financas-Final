const asyncHandler = require('express-async-handler');
const { User, comparePassword } = require('../models/userModel.js');
const RefreshRepo = require('../repos/refreshRepo.js');
const { v4: uuid } = require('uuid');
const { 
  generateTokenPair, 
  setAuthCookies, 
  clearAuthCookies,
  rotateTokens,
  verifyAccessToken,
  verifyRefreshToken
} = require('../utils/tokenManager.js');

// @desc    Registrar um novo usuário
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const user = await User.create({
      name,
      email,
      password, // A senha será criptografada pelo middleware no modelo
      role: 'user'
    });

    if (user) {
      // Login automático pós-cadastro
      const payload = { 
        id: user._id.toString(), 
        role: 'user',
        type: 'access'
      };
      
      const jti = uuid();
      const { accessToken, refreshToken } = generateTokenPair(user._id);
      
      // Salvar refresh token no repositório
      await RefreshRepo.save(jti, user._id, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        deviceId: req.headers['x-device-id'] || 'unknown'
      });
      
      // Incrementar sessões ativas
      await user.incrementActiveSessions();
      
      // Configurar cookies
      setAuthCookies(res, accessToken, refreshToken);
      
      res.status(201).json({ 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: 'user' 
        },
        message: 'Usuário registrado e logado com sucesso'
      });
    } else {
      res.status(400);
      throw new Error('Dados de usuário inválidos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Autenticar usuário & obter tokens
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
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
        
        const payload = { 
          id: user._id.toString(), 
          role: user.role || (user.isAdmin ? 'admin' : 'user'),
          type: 'access'
        };
        
        const jti = uuid();
        const { accessToken, refreshToken } = generateTokenPair(user._id);
        
        // Salvar refresh token no repositório
        await RefreshRepo.save(jti, user._id, {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          deviceId: req.headers['x-device-id'] || 'unknown'
        });
        
        // Incrementar sessões ativas
        await user.incrementActiveSessions();
        
        // Configurar cookies httpOnly
        setAuthCookies(res, accessToken, refreshToken);
        
        // Resposta sem expor tokens no body
        const responseData = {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            role: user.role || (user.isAdmin ? 'admin' : 'user')
          },
          message: 'Login realizado com sucesso'
        };
        
        console.log('📤 Dados enviados no login:', {
          _id: responseData.user.id,
          name: responseData.user.name,
          email: responseData.user.email,
          hasImage: !!responseData.user.image,
          imageSize: responseData.user.image ? responseData.user.image.length : 0,
          isAdmin: responseData.user.isAdmin
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
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token (renovar access token)
// @route   POST /api/users/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    
    if (!refresh_token) {
      return res.status(401).json({ error: 'Sem refresh token' });
    }

    const decoded = verifyRefreshToken(refresh_token);
    
    if (!decoded.jti) {
      return res.status(401).json({ error: 'Refresh token inválido - JTI ausente' });
    }
    
    // Verificar se o refresh token é válido no repositório
    const isValid = await RefreshRepo.isValid(decoded.jti, decoded.id);
    if (!isValid) {
      return res.status(401).json({ error: 'Refresh token inválido ou revogado' });
    }
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }
    
    // Revogar o refresh token atual
    await RefreshRepo.revoke(decoded.jti);
    
    // Gerar novos tokens
    const payload = { 
      id: user._id.toString(), 
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      type: 'access'
    };
    
    const newJti = uuid();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id);
    
    // Salvar novo refresh token
    await RefreshRepo.save(newJti, user._id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceId: req.headers['x-device-id'] || 'unknown'
    });
    
    // Configurar novos cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);
    
    res.json({ 
      message: 'Token renovado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Logout do usuário
// @route   POST /api/users/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    
    if (refresh_token) {
      try {
        // Decodificar o refresh token para obter o JTI
        const decoded = verifyRefreshToken(refresh_token);
        if (decoded.jti) {
          // Revogar o refresh token específico
          await RefreshRepo.revoke(decoded.jti);
        }
      } catch (error) {
        console.log('Refresh token inválido durante logout:', error.message);
      }
    }
    
    // Decrementar sessões ativas
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { activeSessions: -1 }
      });
    }
    
    // Limpar cookies
    clearAuthCookies(res);
    
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout de todas as sessões
// @route   POST /api/users/logout-all
// @access  Private
const logoutAll = async (req, res, next) => {
  try {
    // Revogar todos os refresh tokens do usuário
    await RefreshRepo.revokeAllByUserId(req.user.id);
    
    // Limpar sessões ativas
    await User.findByIdAndUpdate(req.user.id, { activeSessions: 0 });
    
    // Limpar cookies
    clearAuthCookies(res);
    
    res.json({ message: 'Logout de todas as sessões realizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar perfil do usuário
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Buscar sessões ativas (refresh tokens válidos)
      const activeTokens = await RefreshRepo.findValidByUserId(user._id);
      
      console.log('🔍 Perfil encontrado:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasImage: !!user.image,
        imageSize: user.image ? user.image.length : 0,
        isAdmin: user.isAdmin,
        role: user.role,
        activeSessions: user.activeSessions,
        activeTokens: activeTokens.length
      });
      
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          isAdmin: user.isAdmin,
          role: user.role,
          plan: user.plan,
          planExpiry: user.planExpiry,
          planFeatures: user.planFeatures,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          activeSessions: user.activeSessions,
          activeTokens: activeTokens.length,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404);
      throw new Error('Usuário não encontrado');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Obter estatísticas de sessões
// @route   GET /api/users/sessions
// @access  Private
const getSessionStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const activeTokens = await RefreshRepo.findValidByUserId(user._id);
    const tokenAudit = await RefreshRepo.findWithAudit(user._id, 5);
    
    res.json({
      activeSessions: user.activeSessions,
      activeTokens: activeTokens.length,
      recentSessions: tokenAudit,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

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
      token: generateTokenPair(updatedUser._id).accessToken, // Retorna um novo token com os dados atualizados
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
      token: generateTokenPair(user._id).accessToken,
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
  refreshToken,
  logout,
  logoutAll,
  getSessionStats,
}; 