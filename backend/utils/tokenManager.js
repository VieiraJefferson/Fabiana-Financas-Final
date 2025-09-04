const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configurações de tokens
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || 900; // 15 minutos
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || 1209600; // 14 dias

// Gerar JTI único para cada refresh token
const generateJTI = () => crypto.randomBytes(32).toString('hex');

// Gerar access token (curta duração)
const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { 
    expiresIn: Number(ACCESS_TOKEN_TTL) 
  });
};

// Gerar refresh token (longa duração) com JTI
const signRefreshToken = (payload, jti) => {
  return jwt.sign({ 
    ...payload, 
    jti,
    type: 'refresh'
  }, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: Number(REFRESH_TOKEN_TTL) 
  });
};

// Verificar access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error('Token de acesso inválido ou expirado');
  }
};

// Verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Token de refresh inválido ou expirado');
  }
};

// Helper para setar cookies de forma consistente
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Access token: vida curta (15 min), httpOnly para segurança
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: Number(ACCESS_TOKEN_TTL) * 1000,
    path: '/', // importante
  });
  
  // Refresh token: vida longa (14 dias), SEMPRE httpOnly
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: Number(REFRESH_TOKEN_TTL) * 1000,
    path: '/api/auth', // escopo opcional
  });
};

// Limpar cookies de autenticação
const clearAuthCookies = (res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth' });
};

// Gerar par de tokens com JTI único
const generateTokenPair = (userId) => {
  const jti = generateJTI();
  const accessToken = signAccessToken({ id: userId, type: 'access' });
  const refreshToken = signRefreshToken({ id: userId }, jti);
  
  return {
    accessToken,
    refreshToken,
    jti
  };
};

// Rotacionar tokens (gerar novos tokens com novo JTI)
const rotateTokens = (userId) => {
  return generateTokenPair(userId);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  generateTokenPair,
  rotateTokens,
  generateJTI,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL
};
