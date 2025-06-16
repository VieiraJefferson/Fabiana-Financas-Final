const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/planModel.js');
const connectDB = require('../config/db.js');

dotenv.config();

const defaultPlans = [
  {
    name: 'free',
    displayName: 'Plano Gratuito',
    description: 'Ideal para começar sua jornada financeira',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      maxTransactions: 100,
      maxCategories: 10,
      maxGoals: 3,
      hasAdvancedReports: false,
      hasVideoAccess: false,
      hasExport: false,
      hasPrioritySupport: false,
      hasMultipleAccounts: false,
    },
    highlights: [
      'Até 100 transações por mês',
      'Até 10 categorias personalizadas',
      'Até 3 metas financeiras',
      'Relatórios básicos',
      'Suporte por email',
    ],
    isActive: true,
    order: 1,
    isPopular: false,
  },
  {
    name: 'premium',
    displayName: 'Plano Premium',
    description: 'Para quem quer ter controle total das finanças',
    price: {
      monthly: 19.90,
      yearly: 199.00,
    },
    features: {
      maxTransactions: 1000,
      maxCategories: 50,
      maxGoals: 15,
      hasAdvancedReports: true,
      hasVideoAccess: true,
      hasExport: true,
      hasPrioritySupport: true,
      hasMultipleAccounts: false,
    },
    highlights: [
      'Até 1000 transações por mês',
      'Até 50 categorias personalizadas',
      'Até 15 metas financeiras',
      'Relatórios avançados com gráficos',
      'Acesso completo aos vídeos de mentoria',
      'Export de dados (PDF/Excel)',
      'Suporte prioritário',
    ],
    isActive: true,
    order: 2,
    isPopular: true,
  },
  {
    name: 'enterprise',
    displayName: 'Plano Enterprise',
    description: 'Para empresas e consultores financeiros',
    price: {
      monthly: 49.90,
      yearly: 499.00,
    },
    features: {
      maxTransactions: -1, // Ilimitado
      maxCategories: -1, // Ilimitado
      maxGoals: -1, // Ilimitado
      hasAdvancedReports: true,
      hasVideoAccess: true,
      hasExport: true,
      hasPrioritySupport: true,
      hasMultipleAccounts: true,
    },
    highlights: [
      'Transações ilimitadas',
      'Categorias ilimitadas',
      'Metas ilimitadas',
      'Múltiplas contas bancárias',
      'Relatórios empresariais',
      'Acesso completo aos vídeos',
      'API para integrações',
      'Suporte dedicado 24/7',
    ],
    isActive: true,
    order: 3,
    isPopular: false,
  },
];

const initPlans = async () => {
  try {
    await connectDB();
    
    console.log('🗄️ Inicializando planos...');
    
    // Limpar planos existentes
    await Plan.deleteMany({});
    console.log('✅ Planos existentes removidos');
    
    // Inserir novos planos
    await Plan.insertMany(defaultPlans);
    console.log('✅ Planos padrão criados com sucesso!');
    
    // Listar planos criados
    const plans = await Plan.find().sort({ order: 1 });
    console.log('\n📋 Planos criados:');
    plans.forEach(plan => {
      console.log(`- ${plan.displayName}: R$ ${plan.price.monthly}/mês`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar planos:', error);
    process.exit(1);
  }
};

initPlans(); 