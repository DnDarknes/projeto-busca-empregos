// middlewares/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';

// Configuração do armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Renomeia o arquivo
  }
});

// Middleware do multer
const upload = multer({ storage: storage });

export default upload;
