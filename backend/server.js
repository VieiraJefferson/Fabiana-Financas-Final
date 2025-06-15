const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const goalRoutes = require('./routes/goalRoutes.js');
const budgetRoutes = require('./routes/budgetRoutes.js');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Para aceitar dados JSON no corpo da requisição

app.get('/', (req, res) => {
  res.send('API está rodando...');
});

// Servir a pasta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetRoutes);

// Middlewares de erro (devem ser os últimos)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001; // Usaremos uma porta diferente para o backend

app.listen(
  PORT,
  console.log(`Servidor rodando no modo ${process.env.NODE_ENV} na porta ${PORT}`)
); 