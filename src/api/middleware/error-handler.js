// middleware/error-handler.js

/**
 * Middleware para manejar errores en la API
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error en la API:', err);
  
  // Determinar el código de estado HTTP
  let statusCode = 500;
  let mensaje = 'Error interno del servidor';
  
  // Manejar diferentes tipos de errores
  if (err.name === 'ValidationError') {
    statusCode = 400;
    mensaje = err.message || 'Error de validación';
  } else if (err.name === 'AuthenticationError') {
    statusCode = 401;
    mensaje = 'No autorizado';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    mensaje = 'Acceso prohibido';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    mensaje = err.message || 'Recurso no encontrado';
  } else if (err.code === 'PGREST') {
    // Errores específicos de Supabase
    statusCode = 400;
    mensaje = 'Error en la base de datos';
  } else if (err.name === 'OpenAIError') {
    statusCode = 500;
    mensaje = 'Error en el servicio de OpenAI';
  }
  
  // Enviar respuesta de error
  res.status(statusCode).json({
    error: {
      mensaje,
      detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
}

/**
 * Middleware para manejar rutas no encontradas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      mensaje: 'Ruta no encontrada',
      ruta: req.originalUrl
    }
  });
}

/**
 * Clase personalizada para errores de validación
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Clase personalizada para errores de autenticación
 */
export class AuthenticationError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Clase personalizada para errores de acceso prohibido
 */
export class ForbiddenError extends Error {
  constructor(message = 'Acceso prohibido') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Clase personalizada para errores de recurso no encontrado
 */
export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Clase personalizada para errores de OpenAI
 */
export class OpenAIError extends Error {
  constructor(message = 'Error en el servicio de OpenAI') {
    super(message);
    this.name = 'OpenAIError';
  }
}

export default {
  errorHandler,
  notFoundHandler,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  OpenAIError
};
