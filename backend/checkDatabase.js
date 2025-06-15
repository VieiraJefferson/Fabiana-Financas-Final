const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Função para verificar o banco de dados
const checkDatabase = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    console.log('Conectado ao MongoDB para verificação');

    // Verificar a conexão
    console.log('Estado da conexão:', mongoose.connection.readyState);
    console.log('URI do MongoDB:', process.env.MONGO_URI);
    console.log('Nome do banco de dados:', mongoose.connection.db.databaseName);

    // Listar todas as coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nColeções existentes:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Verificar se as coleções esperadas existem
    const expectedCollections = ['users', 'categories', 'transactions', 'goals'];
    console.log('\nVerificação de coleções esperadas:');
    expectedCollections.forEach(collName => {
      const exists = collections.some(coll => coll.name === collName);
      console.log(`- ${collName}: ${exists ? 'Existe' : 'Não existe'}`);
    });

    // Contar documentos em cada coleção
    console.log('\nContagem de documentos por coleção:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documentos`);
    }

  } catch (error) {
    console.error('Erro na verificação do banco de dados:', error);
  } finally {
    // Fechar a conexão
    await mongoose.connection.close();
    console.log('\nConexão com MongoDB fechada');
    process.exit(0);
  }
};

// Executar a verificação
checkDatabase(); 