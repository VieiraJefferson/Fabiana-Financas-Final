const stripe = require('stripe');

// Garantir que as variáveis de ambiente estão carregadas
require('dotenv').config();

// Verificar se a chave existe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
  console.warn('As funcionalidades de pagamento não estarão disponíveis');
  module.exports = null;
  return;
}

// Inicializar Stripe com a chave secreta
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

console.log('✅ Stripe inicializado com sucesso');

module.exports = stripeInstance; 