const multer = require('multer');
const path = require('path');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Garante que o diretório 'uploads/' exista.
    // O ideal seria criar este diretório manualmente ou com um script na inicialização.
    cb(null, 'uploads/'); // Salva os arquivos na pasta 'uploads'
  },
  filename(req, file, cb) {
    // Define um nome de arquivo único para evitar colisões
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Função para filtrar apenas arquivos de imagem
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens (jpg, jpeg, png) são permitidas!'));
  }
}

// Inicialização do multer com as configurações
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload; 