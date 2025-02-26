// middleware/rate-limiter.js

/**
 * Implementación simple de limitador de tasa en memoria
 * En producción, se recomienda usar una solución más robusta como Redis
 */
class MemoryStore {
  constructor() {
    this.store = new Map();
    
    // Limpiar entradas antiguas cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  /**
   * Incrementa el contador para una clave
   * @param {string} key - Clave única (por ejemplo, IP o ID de usuario)
   * @returns {number} - Nuevo valor del contador
   */
  increment(key) {
    const now = Date.now();
    const record = this.store.get(key) || { count: 0, resetAt: now + 60 * 1000 };
    
    // Si ya pasó el tiempo de reseteo, reiniciar contador
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + 60 * 1000; // Resetear cada minuto
    } else {
      record.count += 1;
    }
    
    this.store.set(key, record);
    return record.count;
  }
  
  /**
   * Obtiene el tiempo restante para el reseteo
   * @param {string} key - Clave única
   * @returns {number} - Tiempo en milisegundos
   */
  getResetTime(key) {
    const record = this.store.get(key);
    if (!record) return 0;
    
    return Math.max(0, record.resetAt - Date.now());
  }
  
  /**
   * Limpia entradas antiguas
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Instancia global del almacén
const store = new MemoryStore();

/**
 * Middleware para limitar la tasa de solicitudes
 * @param {Object} options - Opciones de configuración
 * @returns {Function} - Middleware de Express
 */
export function rateLimiter(options = {}) {
  const {
    max = 60, // Máximo de solicitudes por minuto
    message = 'Demasiadas solicitudes, por favor intenta de nuevo más tarde',
    keyGenerator = (req) => req.ip // Por defecto, usar IP
  } = options;
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    const count = store.increment(key);
    const resetTime = store.getResetTime(key);
    
    // Establecer encabezados de límite de tasa
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
    
    // Si se excede el límite, enviar error 429
    if (count > max) {
      res.setHeader('Retry-After', Math.ceil(resetTime / 1000));
      return res.status(429).json({
        error: {
          mensaje: message,
          retryAfter: Math.ceil(resetTime / 1000)
        }
      });
    }
    
    next();
  };
}

/**
 * Configuraciones predefinidas para diferentes tipos de rutas
 */
export const limiters = {
  // Limitar rutas de generación de contenido (más restrictivo)
  contentGeneration: rateLimiter({
    max: 10, // 10 solicitudes por minuto
    message: 'Has alcanzado el límite de generación de contenido. Por favor, espera un momento.'
  }),
  
  // Limitar rutas de análisis
  analysis: rateLimiter({
    max: 20, // 20 solicitudes por minuto
    message: 'Has alcanzado el límite de análisis. Por favor, espera un momento.'
  }),
  
  // Limitar rutas generales
  general: rateLimiter({
    max: 60 // 60 solicitudes por minuto
  })
};

export default rateLimiter;
