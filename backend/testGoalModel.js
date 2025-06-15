const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Goal } = require('./models/goalModel');

dotenv.config();

// Função para testar a conexão e o modelo Goal
const testGoalModel = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    console.log('Conectado ao MongoDB para teste');

    // Verificar se a coleção goals existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Coleções existentes:', collectionNames);
    
    const goalCollectionExists = collectionNames.includes('goals');
    console.log('Coleção goals existe?', goalCollectionExists);

    // Tentar criar um documento de teste
    console.log('Tentando criar uma meta de teste...');
    const testGoal = await Goal.create({
      title: 'Meta de Teste',
      description: 'Esta é uma meta de teste criada diretamente',
      type: 'economia',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: new Date('2024-12-31'),
      priority: 'media',
      user: new mongoose.Types.ObjectId(), // ID fictício para teste
    });

    console.log('Meta de teste criada com sucesso:', testGoal);

    // Buscar todas as metas
    const allGoals = await Goal.find();
    console.log(`Total de metas na coleção: ${allGoals.length}`);
    console.log('Metas:', allGoals);

  } catch (error) {
    console.error('Erro no teste do modelo Goal:', error);
  } finally {
    // Fechar a conexão
    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada');
    process.exit(0);
  }
};

// Executar o teste
testGoalModel(); 