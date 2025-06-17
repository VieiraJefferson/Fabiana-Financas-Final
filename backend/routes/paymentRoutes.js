const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleStripeWebhook,
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

// @desc    Webhook do Stripe (raw body necessário)
// @route   POST /api/payments/webhook
// @access  Public (verificado via Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

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

// @route   GET /api/payments/subscription
// @desc    Obter informações da assinatura do usuário
// @access  Private
router.get('/subscription', protect, getSubscriptionInfo);

module.exports = router; 