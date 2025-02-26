// routes/twitter-content.js
import express from 'express';
import authMiddleware from '../middleware/auth-middleware';
import { 
  createTwitterContent, 
  getTwitterContent, 
  analyzeTwitterContent, 
  updateTwitterContent 
} from '../controllers/twitter-controller';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para contenido de Twitter
router.post('/create', createTwitterContent);
router.get('/:accountId', getTwitterContent);
router.post('/analyze', analyzeTwitterContent);
router.put('/:contentId', updateTwitterContent);

export default router;
