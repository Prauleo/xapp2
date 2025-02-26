// scripts/test-api.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Configurar dotenv para cargar variables de entorno desde .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Obtener las credenciales de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las credenciales estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las credenciales de Supabase no están definidas en .env.local');
  process.exit(1);
}

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// URL base de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Función para crear un usuario de prueba
async function createTestUser() {
  try {
    console.log('Creando usuario de prueba...');
    
    // Generar un correo electrónico aleatorio
    const randomEmail = `test-${Date.now()}@example.com`;
    const password = 'Test123456!';
    
    // Registrar el usuario
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: randomEmail,
      password: password
    });
    
    if (authError) {
      throw authError;
    }
    
    console.log('✅ Usuario de prueba creado:', randomEmail);
    
    return {
      user: authData.user,
      session: authData.session
    };
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message);
    return null;
  }
}

// Función para crear una cuenta de Twitter
async function createTwitterAccount(userId) {
  try {
    console.log('\nCreando cuenta de Twitter...');
    
    // Datos de la cuenta
    const accountData = {
      user_id: userId,
      platform: 'twitter',
      username: 'test_user',
      display_name: 'Test User',
      tone: 'Profesional pero cercano',
      idioma: 'es'
    };
    
    // Crear la cuenta
    const { data, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Cuenta de Twitter creada:', data[0].id);
    
    return data[0];
  } catch (error) {
    console.error('❌ Error al crear cuenta de Twitter:', error.message);
    return null;
  }
}

// Función para probar la generación de contenido
async function testContentGeneration(accountId, accessToken) {
  try {
    console.log('\nProbando generación de contenido para Twitter...');
    
    // Datos para la generación de contenido
    const contentData = {
      accountId,
      ideaPrincipal: 'Compartir consejos sobre cómo mejorar la productividad al programar',
      contextoAdicional: 'Enfocarse en técnicas como Pomodoro, organización del espacio de trabajo y herramientas útiles',
      esHilo: false
    };
    
    // Hacer la solicitud a la API
    const response = await fetch(`${API_BASE_URL}/twitter/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(contentData)
    });
    
    // Verificar la respuesta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Generación de contenido exitosa');
    console.log('\nContenido generado:');
    console.log(JSON.stringify(data.options, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error al generar contenido:', error.message);
    return null;
  }
}

// Función para limpiar datos de prueba
async function cleanupTestData(userId, accountId) {
  try {
    console.log('\nLimpiando datos de prueba...');
    
    // Eliminar contenido
    if (accountId) {
      const { error: contentError } = await supabase
        .from('content')
        .delete()
        .eq('account_id', accountId);
      
      if (contentError) {
        console.error('Error al eliminar contenido:', contentError.message);
      } else {
        console.log('✅ Contenido eliminado');
      }
      
      // Eliminar cuenta
      const { error: accountError } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (accountError) {
        console.error('Error al eliminar cuenta:', accountError.message);
      } else {
        console.log('✅ Cuenta eliminada');
      }
    }
    
    // Eliminar usuario
    if (userId) {
      const { error: userError } = await supabase.auth.admin.deleteUser(userId);
      
      if (userError) {
        console.error('Error al eliminar usuario:', userError.message);
      } else {
        console.log('✅ Usuario eliminado');
      }
    }
    
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error al limpiar datos de prueba:', error.message);
  }
}

// Función principal
async function main() {
  console.log('=== Test de la API de Generación de Contenido para Twitter ===\n');
  
  // Verificar que el servidor esté en ejecución
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    
    if (!response.ok) {
      throw new Error(`Error al conectar con la API: ${response.statusText}`);
    }
    
    console.log('✅ Servidor en ejecución');
  } catch (error) {
    console.error('❌ Error al conectar con la API:', error.message);
    console.error('Asegúrate de que el servidor esté en ejecución (npm run dev)');
    process.exit(1);
  }
  
  let userId = null;
  let accountId = null;
  
  try {
    // Crear usuario de prueba
    const userData = await createTestUser();
    
    if (!userData) {
      throw new Error('No se pudo crear el usuario de prueba');
    }
    
    userId = userData.user.id;
    
    // Crear cuenta de Twitter
    const account = await createTwitterAccount(userId);
    
    if (!account) {
      throw new Error('No se pudo crear la cuenta de Twitter');
    }
    
    accountId = account.id;
    
    // Probar generación de contenido
    await testContentGeneration(accountId, userData.session.access_token);
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
  } finally {
    // Limpiar datos de prueba
    await cleanupTestData(userId, accountId);
  }
  
  console.log('\n=== Fin del Test ===');
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
