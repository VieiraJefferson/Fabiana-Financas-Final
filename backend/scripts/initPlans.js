const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/planModel.js');
const connectDB = require('../config/db.js');

dotenv.config();

const plans = [
  {
    name: 'free',
    displayName: 'Plano Gratuito',
    description: 'Ideal para começar sua jornada financeira',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'BRL',
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
    stripePriceId: {
      monthly: null,
      yearly: null,
    }
  },
  {
    name: 'premium',
    displayName: 'Plano Premium',
    description: 'Para quem quer ter controle total das finanças',
    price: {
      monthly: 59.90,
      yearly: 599.00,
    },
    currency: 'BRL',
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
    stripePriceId: {
      monthly: null,
      yearly: null,
    }
  },
  {
    name: 'enterprise',
    displayName: 'Plano VIP',
    description: 'Experiência completa com mentoria personalizada',
    price: {
      monthly: 99.90,
      yearly: 999.00,
    },
    currency: 'BRL',
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
      'Mentoria individual semanal',
      'Planejamento financeiro personalizado',
      'Análise de investimentos',
      'Suporte dedicado 24/7',
    ],
    isActive: true,
    order: 3,
    isPopular: false,
    stripePriceId: {
      monthly: null,
      yearly: null,
    }
  }
];

const initPlans = async () => {
  try {
    await connectDB();
    
    console.log('🗄️ Inicializando planos...');
    
    // Verificar se já existem planos
    const existingPlans = await Plan.find();
    
    if (existingPlans.length > 0) {
      console.log(`Já existem ${existingPlans.length} planos no banco de dados:`);
      existingPlans.forEach(plan => {
        // Compatibilidade com estruturas antigas e novas
        const price = typeof plan.price === 'number' ? plan.price : (plan.price?.monthly || 0);
        const period = plan.billing_period || 'month';
        console.log(`- ${plan.name || plan.displayName}: R$ ${price.toFixed(2)}/${period}`);
      });
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('Deseja substituir os planos existentes? (s/N): ', (answer) => {
          rl.close();
          if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
            replacePlans().then(resolve);
          } else {
            console.log('Operação cancelada.');
            process.exit(0);
          }
        });
      });
    } else {
      await createPlans();
    }

  } catch (error) {
    console.error('Erro ao inicializar planos:', error);
    process.exit(1);
  }
};

async function replacePlans() {
  try {
    // Remover planos existentes
    await Plan.deleteMany({});
    console.log('Planos existentes removidos.');
    
    await createPlans();
  } catch (error) {
    console.error('Erro ao substituir planos:', error);
    process.exit(1);
  }
}

async function createPlans() {
  try {
    // Criar novos planos
    const createdPlans = await Plan.insertMany(plans);
    
    console.log(`\n✅ ${createdPlans.length} planos criados com sucesso:`);
    createdPlans.forEach(plan => {
      console.log(`- ${plan.displayName}: R$ ${plan.price.monthly.toFixed(2)}/mês`);
      console.log(`  Recursos: ${plan.highlights.length} destaques`);
      console.log(`  ID: ${plan._id}`);
      console.log('');
    });
    
    console.log('🎉 Inicialização concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente do Stripe');
    console.log('2. Os produtos e preços do Stripe serão criados automaticamente no primeiro checkout');
    console.log('3. Teste o sistema de pagamentos');
    
  } catch (error) {
    console.error('Erro ao criar planos:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada.');
    process.exit(0);
  }
}

// Executar apenas se o script for chamado diretamente
if (require.main === module) {
  initPlans();
}

module.exports = { initPlans }; 