const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users.js');
const User = require('./models/userModel.js');
const connectDB = require('./config/db.js');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Apaga todos os usuários existentes
    await User.deleteMany();

    // Insere os novos usuários (a senha será criptografada pelo middleware no userModel)
    await User.insertMany(users);

    console.log('Dados importados com sucesso!');
    process.exit();
  } catch (error) {
    console.error(`Erro: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log('Dados destruídos com sucesso!');
    process.exit();
  } catch (error) {
    console.error(`Erro: ${error}`);
    process.exit(1);
  }
};

// Lógica para rodar o script via linha de comando
// Ex: node backend/seeder -d (para destruir)
// Ex: node backend/seeder (para importar)
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 