const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Usar diretório temporário do sistema para compatibilidade com Render
    const uploadDir = path.join(os.tmpdir(), 'uploads');
    
    console.log('=== MULTER DESTINATION DEBUG ===');
    console.log('Diretório de upload:', uploadDir);
    console.log('OS tmpdir:', os.tmpdir());
    
    // Garante que o diretório temporário exista
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Diretório criado:', uploadDir);
      } else {
        console.log('✅ Diretório já existe:', uploadDir);
      }
      
      // Verificar permissões de escrita
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('✅ Permissões de escrita OK');
      
    } catch (error) {
      console.error('❌ Erro ao criar/acessar diretório:', error);
      return cb(error, null);
    }
    
    cb(null, uploadDir);
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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('=== DEBUG MULTER FILTER ===');
    console.log('File info:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    checkFileType(file, cb);
  },
});

module.exports = upload; 