// utils/validators.js

/**
 * Valida los datos de una cuenta
 * @param {Object} accountData - Datos de la cuenta a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarCuenta(accountData) {
  const errores = [];
  
  // Validar campos requeridos
  if (!accountData.user_id) {
    errores.push('El ID de usuario es requerido');
  }
  
  if (!accountData.platform) {
    errores.push('La plataforma es requerida');
  } else if (!['twitter', 'instagram'].includes(accountData.platform)) {
    errores.push('La plataforma debe ser "twitter" o "instagram"');
  }
  
  if (!accountData.username) {
    errores.push('El nombre de usuario es requerido');
  } else if (accountData.username.length > 50) {
    errores.push('El nombre de usuario no puede exceder los 50 caracteres');
  }
  
  // Validar campos opcionales
  if (accountData.display_name && accountData.display_name.length > 100) {
    errores.push('El nombre de visualización no puede exceder los 100 caracteres');
  }
  
  if (accountData.idioma && accountData.idioma.length > 10) {
    errores.push('El idioma no puede exceder los 10 caracteres');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos de contenido para Twitter
 * @param {Object} contentData - Datos del contenido a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarContenidoTwitter(contentData) {
  const errores = [];
  
  // Validar campos requeridos
  if (!contentData.accountId) {
    errores.push('El ID de la cuenta es requerido');
  }
  
  if (!contentData.ideaPrincipal) {
    errores.push('La idea principal es requerida');
  }
  
  // Validar tipo de contenido
  if (contentData.esHilo !== undefined && typeof contentData.esHilo !== 'boolean') {
    errores.push('El campo "esHilo" debe ser un valor booleano');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos para analizar un tweet
 * @param {Object} analyzeData - Datos para el análisis
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarAnalisisTweet(analyzeData) {
  const errores = [];
  
  // Validar campos requeridos
  if (!analyzeData.tweetText) {
    errores.push('El texto del tweet es requerido');
  } else if (analyzeData.tweetText.length > 280) {
    errores.push('El texto del tweet no puede exceder los 280 caracteres');
  }
  
  if (!analyzeData.accountId) {
    errores.push('El ID de la cuenta es requerido');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos para actualizar un contenido
 * @param {Object} updateData - Datos para la actualización
 * @returns {Object} - Objeto con el resultado de la validación
 */
export function validarActualizacionContenido(updateData) {
  const errores = [];
  
  // Validar campos requeridos
  if (!updateData.contentId) {
    errores.push('El ID del contenido es requerido');
  }
  
  if (updateData.editedText === undefined) {
    errores.push('El texto editado es requerido');
  }
  
  // Validar estado
  if (updateData.status && !['draft', 'published', 'archived'].includes(updateData.status)) {
    errores.push('El estado debe ser "draft", "published" o "archived"');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

export default {
  validarCuenta,
  validarContenidoTwitter,
  validarAnalisisTweet,
  validarActualizacionContenido
};
