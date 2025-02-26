// services/openai.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Genera la voz de la cuenta basada en el contenido de referencia y preferencias
 * @param {Object} cuenta - Datos de la cuenta
 * @returns {Promise<string>} - Perfil de voz generado
 */
export async function generarVozCuenta(cuenta) {
  try {
    const { reference_content, content_preferences, tone, platform } = cuenta;
    
    // Construimos el prompt para el análisis
    const systemPrompt = `Eres un experto analista de estilo de escritura y tono para redes sociales.
Tu tarea es crear un perfil detallado de la "voz" única de una cuenta de ${platform === 'twitter' ? 'Twitter' : 'Instagram'} basándote en:
1. Contenido de referencia proporcionado por el usuario
2. Preferencias de contenido especificadas
3. Tono deseado

Este perfil de voz será utilizado para generar nuevo contenido que suene auténticamente como el usuario.

FORMATO DE SALIDA:
Proporciona un análisis detallado (400-600 palabras) que incluya:
- Patrones léxicos distintivos (palabras favoritas, jerga, expresiones recurrentes)
- Estructura de oraciones y párrafos (longitud, complejidad, ritmo)
- Tono y personalidad (formal/informal, humorístico/serio, etc.)
- Temas recurrentes y áreas de interés
- Estilo de interacción con la audiencia
- Cualquier otro elemento distintivo de su voz`;

    const userPrompt = `CONTENIDO DE REFERENCIA:
${reference_content ? reference_content.join('\n\n') : 'No proporcionado'}

PREFERENCIAS DE CONTENIDO:
${JSON.stringify(content_preferences || {}, null, 2)}

TONO DESEADO:
${tone || 'No especificado'}

PLATAFORMA:
${platform === 'twitter' ? 'Twitter' : 'Instagram'}

Analiza estos elementos y crea un perfil detallado de la voz única de esta cuenta.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generando voz de cuenta:', error);
    throw new Error('No se pudo generar el perfil de voz. Por favor, intenta de nuevo.');
  }
}

/**
 * Genera ideas de contenido para Twitter
 * @param {Object} cuenta - Datos de la cuenta
 * @param {string} vozCuenta - Perfil de voz de la cuenta
 * @param {number} cantidad - Cantidad de ideas a generar
 * @returns {Promise<Array>} - Lista de ideas generadas
 */
export async function generarIdeas(cuenta, vozCuenta, cantidad = 5) {
  try {
    const systemPrompt = `Eres un experto creador de contenido para ${cuenta.platform === 'twitter' ? 'Twitter' : 'Instagram'}.
Tu tarea es generar ${cantidad} ideas originales de contenido que:
1. Se alineen perfectamente con la voz única de la cuenta
2. Sean relevantes para su audiencia y nicho
3. Tengan potencial de engagement
4. Sean diversas en formato y enfoque

FORMATO DE SALIDA:
Para cada idea, proporciona:
1. TÍTULO BREVE: Una descripción concisa de la idea
2. CONCEPTO: Explicación de 2-3 oraciones sobre el contenido
3. ENFOQUE: Ángulo o perspectiva única
4. VALOR: Beneficio para la audiencia`;

    const userPrompt = `VOZ DE LA CUENTA:
${vozCuenta}

PLATAFORMA: ${cuenta.platform === 'twitter' ? 'Twitter' : 'Instagram'}
TONO DESEADO: ${cuenta.tone || 'No especificado'}
IDIOMA: ${cuenta.idioma === 'en' ? 'Inglés' : 'Español'}

Genera ${cantidad} ideas de contenido originales y atractivas que se alineen perfectamente con esta voz.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    // Procesamos la respuesta para extraer las ideas
    const contenido = response.choices[0].message.content;
    const ideas = contenido.split(/IDEA \d+:/g).filter(idea => idea.trim().length > 0);
    
    return ideas.map(idea => {
      const tituloMatch = idea.match(/TÍTULO BREVE:(.*?)(?=CONCEPTO:|$)/s);
      const conceptoMatch = idea.match(/CONCEPTO:(.*?)(?=ENFOQUE:|$)/s);
      const enfoqueMatch = idea.match(/ENFOQUE:(.*?)(?=VALOR:|$)/s);
      const valorMatch = idea.match(/VALOR:(.*?)(?=$)/s);
      
      return {
        titulo: tituloMatch ? tituloMatch[1].trim() : '',
        concepto: conceptoMatch ? conceptoMatch[1].trim() : '',
        enfoque: enfoqueMatch ? enfoqueMatch[1].trim() : '',
        valor: valorMatch ? valorMatch[1].trim() : ''
      };
    });
  } catch (error) {
    console.error('Error generando ideas:', error);
    throw new Error('No se pudieron generar ideas. Por favor, intenta de nuevo.');
  }
}

/**
 * Genera tweets automáticos basados en la idea principal y contexto adicional
 * @param {Object} contextoCompleto - Contexto completo para la generación
 * @param {Object} cuenta - Datos de la cuenta
 * @param {string} vozCuenta - Perfil de voz de la cuenta
 * @returns {Promise<Array>} - Opciones de tweets generados
 */
export async function generarTweetsAutomaticos(contextoCompleto, cuenta, vozCuenta) {
  try {
    const { ideaPrincipal, contextoAdicional, esHilo = false } = contextoCompleto;
    
    // Determinamos si es un tweet único o un hilo
    const formatoSalida = esHilo 
      ? `FORMATO DE SALIDA:
Genera 3 opciones diferentes de hilos de Twitter. Cada opción debe incluir:

OPCIÓN 1 (HILO CORTO - 3 tweets):
TWEET 1: [Primer tweet del hilo, máximo 280 caracteres]
TWEET 2: [Segundo tweet, máximo 280 caracteres]
TWEET 3: [Tercer tweet, máximo 280 caracteres]

OPCIÓN 2 (HILO MEDIO - 4-5 tweets):
TWEET 1: [Primer tweet del hilo, máximo 280 caracteres]
TWEET 2: [Segundo tweet, máximo 280 caracteres]
...y así sucesivamente

OPCIÓN 3 (HILO LARGO - 6-7 tweets):
TWEET 1: [Primer tweet del hilo, máximo 280 caracteres]
TWEET 2: [Segundo tweet, máximo 280 caracteres]
...y así sucesivamente

Cada tweet debe tener máximo 280 caracteres y NO debe incluir hashtags.
El primer tweet de cada hilo debe captar la atención y funcionar como gancho.
El hilo completo debe contar una historia coherente o desarrollar una idea de forma lógica.`
      : `FORMATO DE SALIDA:
Genera 3 opciones diferentes de tweets únicos:

OPCIÓN 1 (TWEET CORTO - máximo 140 caracteres):
[Tweet corto y conciso]

OPCIÓN 2 (TWEET MEDIO - entre 141-200 caracteres):
[Tweet de longitud media]

OPCIÓN 3 (TWEET LARGO - entre 201-280 caracteres):
[Tweet más elaborado]

Cada tweet debe tener su longitud específica y NO debe incluir hashtags.
Cada opción debe ser única en enfoque y estilo, manteniendo la voz de la cuenta.`;

    const systemPrompt = `Eres un experto creador de contenido para Twitter con profunda comprensión de lo que funciona en la plataforma.
Tu tarea es generar ${esHilo ? 'hilos de Twitter' : 'tweets únicos'} que sean altamente efectivos y personalizados.

CARACTERÍSTICAS CLAVE:
- Contenido que capte la atención en los primeros segundos
- Texto que refleje perfectamente la voz única del usuario
- Enfoque en generar engagement (respuestas, retweets)
- Adaptado a las limitaciones de Twitter (280 caracteres por tweet)
- NO usar hashtags en ningún caso

${formatoSalida}

REQUISITOS CRÍTICOS:
- El contenido debe ser auténtico y alineado con la voz única de la cuenta
- Debe ser atractivo y generar interés inmediato
- Idioma: ${cuenta.idioma === 'en' ? 'INGLÉS' : 'ESPAÑOL'} exclusivamente`;

    const prompt = `
VOZ DE LA CUENTA:
${vozCuenta}

INDICACIONES PRINCIPALES (${cuenta.idioma === 'en' ? 'ENGLISH' : 'ESPAÑOL'}):
1. Tono: ${cuenta.tone || 'No especificado'}

IDEAS DEL USUARIO (MÁXIMA PRIORIDAD):
${ideaPrincipal}

CONTEXTO COMPLEMENTARIO:
${contextoAdicional || 'No proporcionado'}

CONFIGURACIÓN:
- Tipo de contenido: ${esHilo ? 'Hilo de tweets' : 'Tweet único'}
- Idioma: ${cuenta.idioma === 'en' ? 'Inglés' : 'Español'}

INSTRUCCIONES ESPECIALES:
- NO incluir hashtags en ningún caso
- Mantener cada tweet dentro del límite de 280 caracteres
- Asegurar que el contenido refleje la voz única de la cuenta
- Generar 3 opciones diferentes con las longitudes especificadas`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    // Procesamos la respuesta para extraer las diferentes opciones
    const contenido = response.choices[0].message.content;
    
    // Extraemos las opciones según el formato (tweet único o hilo)
    if (esHilo) {
      // Para hilos, extraemos cada opción y sus tweets
      const opcionesMatch = contenido.match(/OPCIÓN \d+ \(HILO (?:CORTO|MEDIO|LARGO).*?\):([\s\S]*?)(?=OPCIÓN \d+|$)/g);
      
      if (!opcionesMatch) {
        throw new Error('No se pudieron extraer las opciones de hilos correctamente');
      }
      
      return opcionesMatch.map(opcionTexto => {
        const tweetsMatch = opcionTexto.match(/TWEET \d+: (.*?)(?=TWEET \d+:|$)/g);
        
        if (!tweetsMatch) {
          return {
            tipo: opcionTexto.includes('CORTO') ? 'corto' : opcionTexto.includes('MEDIO') ? 'medio' : 'largo',
            tweets: [opcionTexto.replace(/OPCIÓN \d+ \(HILO (?:CORTO|MEDIO|LARGO).*?\):/, '').trim()]
          };
        }
        
        return {
          tipo: opcionTexto.includes('CORTO') ? 'corto' : opcionTexto.includes('MEDIO') ? 'medio' : 'largo',
          tweets: tweetsMatch.map(tweet => {
            const contenidoTweet = tweet.replace(/TWEET \d+: /, '').trim();
            return contenidoTweet;
          })
        };
      });
    } else {
      // Para tweets únicos, extraemos cada opción
      const opcionesMatch = contenido.match(/OPCIÓN \d+ \(TWEET (?:CORTO|MEDIO|LARGO).*?\):([\s\S]*?)(?=OPCIÓN \d+|$)/g);
      
      if (!opcionesMatch) {
        // Si no podemos extraer con el formato esperado, dividimos por "OPCIÓN"
        const opcionesFallback = contenido.split(/OPCIÓN \d+/g).filter(o => o.trim().length > 0);
        return opcionesFallback.map((opcion, index) => ({
          tipo: index === 0 ? 'corto' : index === 1 ? 'medio' : 'largo',
          tweet: opcion.trim()
        }));
      }
      
      return opcionesMatch.map(opcionTexto => {
        const tipo = opcionTexto.includes('CORTO') ? 'corto' : opcionTexto.includes('MEDIO') ? 'medio' : 'largo';
        const tweet = opcionTexto.replace(/OPCIÓN \d+ \(TWEET (?:CORTO|MEDIO|LARGO).*?\):/, '').trim();
        
        return { tipo, tweet };
      });
    }
  } catch (error) {
    console.error('Error generando tweets:', error);
    throw new Error(error.message || 'No se pudieron generar los tweets. Por favor, intenta de nuevo.');
  }
}

/**
 * Analiza un tweet para extraer información y sugerencias
 * @param {string} tweetTexto - Texto del tweet a analizar
 * @param {Object} cuenta - Datos de la cuenta
 * @returns {Promise<Object>} - Análisis del tweet
 */
export async function analizarTweet(tweetTexto, cuenta) {
  try {
    const systemPrompt = `Eres un experto analista de contenido para Twitter.
Tu tarea es analizar un tweet y proporcionar insights valiosos sobre:
1. Efectividad general
2. Tono y voz
3. Potencial de engagement
4. Sugerencias de mejora

FORMATO DE SALIDA:
Proporciona un análisis estructurado que incluya:

ANÁLISIS GENERAL:
[Evaluación general del tweet en 2-3 oraciones]

TONO Y VOZ:
[Análisis del tono, estilo y voz del tweet]

POTENCIAL DE ENGAGEMENT:
[Evaluación de qué tan probable es que genere interacción]

SUGERENCIAS DE MEJORA:
- [Sugerencia 1]
- [Sugerencia 2]
- [Sugerencia 3]

VERSIÓN MEJORADA:
[Una versión mejorada del tweet basada en tus sugerencias]`;

    const userPrompt = `TWEET A ANALIZAR:
"${tweetTexto}"

CONTEXTO DE LA CUENTA:
Plataforma: Twitter
Tono deseado: ${cuenta.tone || 'No especificado'}
Idioma: ${cuenta.idioma === 'en' ? 'Inglés' : 'Español'}

Por favor, analiza este tweet y proporciona insights valiosos para mejorarlo.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Procesamos la respuesta para extraer las diferentes secciones
    const contenido = response.choices[0].message.content;
    
    const analisisGeneralMatch = contenido.match(/ANÁLISIS GENERAL:([\s\S]*?)(?=TONO Y VOZ:|$)/);
    const tonoVozMatch = contenido.match(/TONO Y VOZ:([\s\S]*?)(?=POTENCIAL DE ENGAGEMENT:|$)/);
    const potencialEngagementMatch = contenido.match(/POTENCIAL DE ENGAGEMENT:([\s\S]*?)(?=SUGERENCIAS DE MEJORA:|$)/);
    const sugerenciasMatch = contenido.match(/SUGERENCIAS DE MEJORA:([\s\S]*?)(?=VERSIÓN MEJORADA:|$)/);
    const versionMejoradaMatch = contenido.match(/VERSIÓN MEJORADA:([\s\S]*?)(?=$)/);
    
    return {
      analisisGeneral: analisisGeneralMatch ? analisisGeneralMatch[1].trim() : '',
      tonoVoz: tonoVozMatch ? tonoVozMatch[1].trim() : '',
      potencialEngagement: potencialEngagementMatch ? potencialEngagementMatch[1].trim() : '',
      sugerencias: sugerenciasMatch 
        ? sugerenciasMatch[1].split('-').filter(s => s.trim().length > 0).map(s => s.trim()) 
        : [],
      versionMejorada: versionMejoradaMatch ? versionMejoradaMatch[1].trim() : ''
    };
  } catch (error) {
    console.error('Error analizando tweet:', error);
    throw new Error('No se pudo analizar el tweet. Por favor, intenta de nuevo.');
  }
}

export default openai;
