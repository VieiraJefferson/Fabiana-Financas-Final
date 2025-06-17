const asyncHandler = require('express-async-handler');
const stripe = require('../config/stripe');
const Plan = require('../models/planModel');
const { User } = require('../models/userModel');

// @desc    Criar sessão de checkout para assinatura
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { planId, billingPeriod = 'monthly' } = req.body;
    const userId = req.user.id;

    // Buscar o plano no banco
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Verificar se o plano é gratuito
    if (plan.name === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Plano gratuito não requer pagamento'
      });
    }

    // Determinar o preço baseado no período
    const price = billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const stripePriceId = billingPeriod === 'yearly' ? plan.stripePriceId?.yearly : plan.stripePriceId?.monthly;

    // Se não tiver stripePriceId configurado, criar um produto e preço no Stripe
    let finalPriceId = stripePriceId;
    
    if (!finalPriceId) {
      // Criar produto no Stripe
      const product = await stripe.products.create({
        name: plan.displayName,
        description: plan.description,
        metadata: {
          planId: plan._id.toString(),
          planName: plan.name
        }
      });

      // Criar preço no Stripe
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100), // Stripe usa centavos
        currency: 'brl',
        recurring: {
          interval: billingPeriod === 'yearly' ? 'year' : 'month',
          interval_count: 1,
        },
        product: product.id,
        metadata: {
          planId: plan._id.toString(),
          billingPeriod: billingPeriod
        }
      });

      finalPriceId = stripePrice.id;

      // Atualizar o plano com o stripePriceId
      const updateField = billingPeriod === 'yearly' ? 'stripePriceId.yearly' : 'stripePriceId.monthly';
      await Plan.findByIdAndUpdate(planId, {
        $set: { [updateField]: finalPriceId }
      });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/mentoria?payment=cancelled`,
      metadata: {
        userId: userId,
        planId: planId,
        billingPeriod: billingPeriod
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
          billingPeriod: billingPeriod
        }
      }
    });

    console.log('✅ Sessão de checkout criada:', session.id);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar pagamento'
    });
  }
});

// @desc    Webhook do Stripe para eventos de pagamento
// @route   POST /api/payments/webhook
// @access  Public (mas verificado via Stripe)
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📨 Stripe Webhook recebido:', event.type);

  // Processar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
    
    default:
      console.log(`🔄 Evento não tratado: ${event.type}`);
  }

  res.json({ received: true });
});

// Funções auxiliares para processar eventos do webhook
const handleCheckoutCompleted = async (session) => {
  try {
    console.log('✅ Checkout completado:', session.id);
    
    const { userId, planId } = session.metadata;
    
    // Buscar usuário e plano
    const user = await User.findById(userId);
    const plan = await Plan.findById(planId);
    
    if (!user || !plan) {
      console.error('❌ Usuário ou plano não encontrado');
      return;
    }

    // Atualizar usuário com novo plano
    user.plan = plan.name;
    user.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    
    // Atualizar features do plano
    user.planFeatures = {
      maxTransactions: plan.features.maxTransactions,
      maxCategories: plan.features.maxCategories,
      maxGoals: plan.features.maxGoals,
      hasAdvancedReports: plan.features.hasAdvancedReports,
      hasVideoAccess: plan.features.hasVideoAccess,
    };

    await user.save();
    
    console.log('✅ Usuário atualizado com novo plano:', plan.name);
    
  } catch (error) {
    console.error('❌ Erro ao processar checkout:', error);
  }
};

const handlePaymentSucceeded = async (invoice) => {
  try {
    console.log('💰 Pagamento realizado com sucesso:', invoice.id);
    
    // Aqui você pode adicionar lógica para renovação de assinatura
    // Por exemplo, estender a data de expiração do plano
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
};

const handlePaymentFailed = async (invoice) => {
  try {
    console.log('❌ Falha no pagamento:', invoice.id);
    
    // Aqui você pode adicionar lógica para lidar com falhas
    // Por exemplo, enviar email de cobrança, downgrade do plano, etc.
    
  } catch (error) {
    console.error('❌ Erro ao processar falha de pagamento:', error);
  }
};

const handleSubscriptionCancelled = async (subscription) => {
  try {
    console.log('🚫 Assinatura cancelada:', subscription.id);
    
    // Aqui você pode adicionar lógica para cancelamento
    // Por exemplo, mover usuário para plano gratuito
    
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento:', error);
  }
};

// @desc    Obter informações de assinatura do usuário
// @route   GET /api/payments/subscription
// @access  Private
const getUserSubscription = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const plan = await Plan.findOne({ name: user.plan });

    res.json({
      success: true,
      data: {
        currentPlan: user.plan,
        planExpiry: user.planExpiry,
        planFeatures: user.planFeatures,
        planDetails: plan
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @desc    Cancelar assinatura
// @route   POST /api/payments/cancel-subscription
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  try {
    // TODO: Implementar cancelamento via Stripe
    // Aqui você buscaria a subscription do usuário no Stripe e cancelaria
    
    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar assinatura'
    });
  }
});

// @desc    Buscar planos disponíveis
// @route   GET /api/payments/plans
// @access  Public
const getAvailablePlans = asyncHandler(async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ order: 1 });
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('❌ Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos'
    });
  }
});

// @desc    Obter informações da assinatura do usuário
// @route   GET /api/payments/subscription
// @access  Private
const getSubscriptionInfo = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar detalhes do plano atual
    const currentPlan = await Plan.findOne({ name: user.plan || 'free' });
    
    const subscriptionInfo = {
      currentPlan: user.plan || 'free',
      planExpiry: user.planExpiry || null,
      planFeatures: user.planFeatures || {
        maxTransactions: 100,
        maxCategories: 10,
        maxGoals: 3,
        hasAdvancedReports: false,
        hasVideoAccess: false,
      },
      planDetails: currentPlan
    };

    res.json({
      success: true,
      data: subscriptionInfo
    });
  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar informações da assinatura'
    });
  }
});

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  getUserSubscription,
  cancelSubscription,
  getAvailablePlans,
  getSubscriptionInfo
}; 