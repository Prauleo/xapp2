// routes/index.js
import express from 'express';
import twitterContentRoutes from './twitter-content';
import { errorHandler, notFoundHandler } from '../middleware/error-handler';
import { limiters } from '../middleware/rate-limiter';

const router = express.Router();

// Aplicar limitador de tasa general a todas las rutas
router.use(limiters.general);

// Rutas de la API
router.use('/twitter', twitterContentRoutes);

// Ruta de verificación de estado
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Manejar rutas no encontradas
router.use(notFoundHandler);

// Manejar errores
router.use(errorHandler);

export default router;
