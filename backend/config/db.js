const mongoose = require('mongoose');

const connectDB = async () => {
  // Verifica se já existe uma conexão para evitar múltiplas conexões
  if (mongoose.connections[0].readyState) {
    console.log('Já conectado ao MongoDB.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // As opções useNewUrlParser e useUnifiedTopology foram removidas.
      // O driver do Mongoose v6+ as gerencia automaticamente.
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1); // Encerra o processo com falha
  }
};

module.exports = connectDB; 