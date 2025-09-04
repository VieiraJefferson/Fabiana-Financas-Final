require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db.js');

const app = express();

// --- [WEBHOOK DO STRIPE - DEVE VIR ANTES DE express.json()] ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const isProd = process.env.NODE_ENV === 'production';

// Webhook do Stripe precisa do body RAW (Buffer)
// ⚠️ Este endpoint DEVE vir ANTES de app.use(express.json())
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Stripe webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Trate os eventos que você usa
    switch (event.type) {
      case 'checkout.session.completed':
        // const session = event.data.object;
        // TODO: marcar pagamento como concluído, liberar recurso, etc.
        break;
      case 'payment_intent.succeeded':
        // const intent = event.data.object;
        // TODO: lógica de sucesso
        break;
      default:
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }

    res.json({ received: true });
  }
);
// --- [FIM DO BLOCO DO WEBHOOK] ---

// Configurações de segurança
app.set('trust proxy', 1); // CRÍTICO para proxies (Vercel/Render/Nginx)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS robusto
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Postman/SSR
    try {
      const u = new URL(origin);
      if (u.hostname.endsWith(".vercel.app") || origin === process.env.FRONTEND_URL) {
        return cb(null, true);
      }
    } catch (_) {}
    return cb(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// Middleware de parsing (AGORA SIM, depois do webhook)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (_, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV || 'development'
}));

// Conectar ao banco de dados
connectDB();

// Rotas da API
app.use('/api', require('./routes/index.js'));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro na aplicação:', err);
  
  // Se for erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Erro de validação',
      details: errors
    });
  }
  
  // Se for erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }
  
  // Se for erro de expiração de JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado'
    });
  }
  
  // Erro genérico
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Rota 404 para endpoints não encontrados
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: '/api'
  });
});

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/api`);
    console.log(`🔐 Sistema de autenticação robusto ativo`);
    console.log(`🍪 Cookies httpOnly configurados`);
    console.log(`🛡️ CORS e segurança configurados`);
    console.log(`📊 Trust proxy configurado para produção`);
  });
} 