// utils/text-processors.js

/**
 * Valida si un texto está dentro del límite de caracteres de Twitter
 * @param {string} texto - Texto a validar
 * @param {number} limite - Límite de caracteres (por defecto 280)
 * @returns {boolean} - True si está dentro del límite, false si no
 */
export function validarLongitudTweet(texto, limite = 280) {
  return texto.length <= limite;
}

/**
 * Trunca un texto para que cumpla con el límite de caracteres de Twitter
 * @param {string} texto - Texto a truncar
 * @param {number} limite - Límite de caracteres (por defecto 280)
 * @returns {string} - Texto truncado
 */
export function truncarTextoTweet(texto, limite = 280) {
  if (texto.length <= limite) {
    return texto;
  }
  
  // Truncamos el texto y añadimos "..." al final
  return texto.substring(0, limite - 3) + '...';
}

/**
 * Divide un texto largo en múltiples tweets para un hilo
 * @param {string} textoCompleto - Texto completo a dividir
 * @param {number} limitePorTweet - Límite de caracteres por tweet (por defecto 280)
 * @returns {Array<string>} - Array de tweets
 */
export function dividirEnHilo(textoCompleto, limitePorTweet = 280) {
  if (textoCompleto.length <= limitePorTweet) {
    return [textoCompleto];
  }
  
  const tweets = [];
  let textoRestante = textoCompleto;
  
  while (textoRestante.length > 0) {
    if (textoRestante.length <= limitePorTweet) {
      tweets.push(textoRestante);
      break;
    }
    
    // Buscamos un punto de corte adecuado (espacio, punto, coma, etc.)
    let indiceCortePerfecto = limitePorTweet;
    
    // Retrocedemos hasta encontrar un espacio o signo de puntuación
    while (indiceCortePerfecto > 0 && 
           !/[\s.,;:!?]/.test(textoRestante.charAt(indiceCortePerfecto))) {
      indiceCortePerfecto--;
    }
    
    // Si no encontramos un punto de corte adecuado, cortamos en el límite
    if (indiceCortePerfecto === 0) {
      indiceCortePerfecto = limitePorTweet - 3;
      tweets.push(textoRestante.substring(0, indiceCortePerfecto) + '...');
    } else {
      // Cortamos en el punto de corte encontrado
      tweets.push(textoRestante.substring(0, indiceCortePerfecto + 1));
    }
    
    // Actualizamos el texto restante
    textoRestante = textoRestante.substring(indiceCortePerfecto + 1);
  }
  
  return tweets;
}

/**
 * Cuenta la cantidad de caracteres de un tweet, considerando URLs
 * @param {string} texto - Texto del tweet
 * @returns {number} - Cantidad de caracteres
 */
export function contarCaracteresTweet(texto) {
  // Las URLs en Twitter cuentan como 23 caracteres, independientemente de su longitud real
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = texto.match(urlRegex) || [];
  
  // Reemplazamos cada URL por un placeholder de 23 caracteres
  let textoModificado = texto;
  urls.forEach(url => {
    textoModificado = textoModificado.replace(url, 'X'.repeat(23));
  });
  
  return textoModificado.length;
}

/**
 * Elimina hashtags de un texto
 * @param {string} texto - Texto con hashtags
 * @returns {string} - Texto sin hashtags
 */
export function eliminarHashtags(texto) {
  return texto.replace(/#[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9_]+/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Formatea un hilo de tweets para mostrar
 * @param {Array<string>} tweets - Array de tweets
 * @returns {string} - Hilo formateado
 */
export function formatearHilo(tweets) {
  return tweets.map((tweet, index) => {
    return `Tweet ${index + 1}/${tweets.length}: ${tweet}`;
  }).join('\n\n');
}

export default {
  validarLongitudTweet,
  truncarTextoTweet,
  dividirEnHilo,
  contarCaracteresTweet,
  eliminarHashtags,
  formatearHilo
};
