const stripe = require('stripe');

// Garantir que as variáveis de ambiente estão carregadas
require('dotenv').config();

// Verificar se a chave existe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
  console.error('Certifique-se de que o arquivo .env existe e contém STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

// Inicializar Stripe com a chave secreta
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

console.log('✅ Stripe inicializado com sucesso');

module.exports = stripeInstance; 