const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getUserSubscription,
  cancelSubscription,
  getAvailablePlans,
  getSubscriptionInfo
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Criar sessão de checkout
// @route   POST /api/payments/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, createCheckoutSession);

// @desc    Obter informações de assinatura
// @route   GET /api/payments/subscription
// @access  Private
router.get('/subscription', protect, getUserSubscription);

// @desc    Cancelar assinatura
// @route   POST /api/payments/cancel-subscription
// @access  Private
router.post('/cancel-subscription', protect, cancelSubscription);

// @route   GET /api/payments/plans
// @desc    Buscar planos disponíveis (público)
// @access  Public
router.get('/plans', getAvailablePlans);

// @route   GET /api/payments/subscription-info
// @desc    Obter informações da assinatura do usuário
// @access  Private
router.get('/subscription-info', protect, getSubscriptionInfo);

module.exports = router; 