// scripts/test-openai.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv para cargar variables de entorno desde .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Obtener la clave de API de OpenAI
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Verificar que la clave de API esté definida
if (!openaiApiKey) {
  console.error('Error: La clave de API de OpenAI no está definida en .env.local');
  process.exit(1);
}

// Crear el cliente de OpenAI
const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true
});

// Función para verificar la conexión con OpenAI
async function testOpenAIConnection() {
  try {
    console.log('Verificando conexión con OpenAI...');
    
    // Intentar obtener los modelos disponibles
    const models = await openai.models.list();
    
    console.log('✅ Conexión exitosa con OpenAI');
    console.log('Modelos disponibles:', models.data.slice(0, 5).map(model => model.id).join(', '), '...');
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con OpenAI:', error.message);
    return false;
  }
}

// Función para probar la generación de contenido para Twitter
async function testTwitterContentGeneration() {
  try {
    console.log('\nProbando generación de contenido para Twitter...');
    
    // Ejemplo de prompt para generar un tweet
    const systemPrompt = `Eres un experto creador de contenido para Twitter con profunda comprensión de lo que funciona en la plataforma.
Tu tarea es generar tweets únicos que sean altamente efectivos y personalizados.

CARACTERÍSTICAS CLAVE:
- Contenido que capte la atención en los primeros segundos
- Texto que refleje perfectamente la voz única del usuario
- Enfoque en generar engagement (respuestas, retweets)
- Adaptado a las limitaciones de Twitter (280 caracteres por tweet)
- NO usar hashtags en ningún caso

FORMATO DE SALIDA:
Genera 3 opciones diferentes de tweets únicos:

OPCIÓN 1 (TWEET CORTO - máximo 140 caracteres):
[Tweet corto y conciso]

OPCIÓN 2 (TWEET MEDIO - entre 141-200 caracteres):
[Tweet de longitud media]

OPCIÓN 3 (TWEET LARGO - entre 201-280 caracteres):
[Tweet más elaborado]

Cada tweet debe tener su longitud específica y NO debe incluir hashtags.
Cada opción debe ser única en enfoque y estilo, manteniendo la voz de la cuenta.

REQUISITOS CRÍTICOS:
- El contenido debe ser auténtico y alineado con la voz única de la cuenta
- Debe ser atractivo y generar interés inmediato
- Idioma: ESPAÑOL exclusivamente`;

    const userPrompt = `
VOZ DE LA CUENTA:
La cuenta tiene un tono profesional pero cercano, utiliza un lenguaje claro y directo. Comparte conocimientos sobre tecnología y desarrollo de software con un enfoque práctico. Ocasionalmente utiliza humor sutil y referencias a la cultura tech.

INDICACIONES PRINCIPALES (ESPAÑOL):
1. Tono: Profesional pero cercano

IDEAS DEL USUARIO (MÁXIMA PRIORIDAD):
Compartir consejos sobre cómo mejorar la productividad al programar

CONTEXTO COMPLEMENTARIO:
Enfocarse en técnicas como Pomodoro, organización del espacio de trabajo y herramientas útiles

CONFIGURACIÓN:
- Tipo de contenido: Tweet único
- Idioma: Español

INSTRUCCIONES ESPECIALES:
- NO incluir hashtags en ningún caso
- Mantener cada tweet dentro del límite de 280 caracteres
- Asegurar que el contenido refleje la voz única de la cuenta
- Generar 3 opciones diferentes con las longitudes especificadas`;

    // Generar contenido
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    console.log('✅ Generación de contenido exitosa');
    console.log('\nContenido generado:');
    console.log(response.choices[0].message.content);
    
    return true;
  } catch (error) {
    console.error('❌ Error al generar contenido para Twitter:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('=== Test de Conexión con OpenAI ===\n');
  
  // Verificar conexión
  const isConnected = await testOpenAIConnection();
  
  if (isConnected) {
    // Probar generación de contenido
    await testTwitterContentGeneration();
  }
  
  console.log('\n=== Fin del Test ===');
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
