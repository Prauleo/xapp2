// scripts/test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Función para verificar la conexión con Supabase
async function testSupabaseConnection() {
  try {
    console.log('Verificando conexión con Supabase...');
    
    // Intentar obtener la lista de tablas
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      // Si hay un error, intentar una consulta más simple
      const { data: healthData, error: healthError } = await supabase.from('_pgrst_health').select('*').limit(1);
      
      if (healthError) {
        throw healthError;
      }
      
      console.log('✅ Conexión exitosa con Supabase (verificación de salud)');
      return true;
    }
    
    console.log('✅ Conexión exitosa con Supabase');
    console.log('Tablas públicas:', data.map(t => t.tablename).join(', '));
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
    
    // Intentar una verificación más básica
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Conexión exitosa con Supabase Auth');
      return true;
    } catch (authError) {
      console.error('❌ Error al conectar con Supabase Auth:', authError.message);
      return false;
    }
  }
}

// Función para verificar la existencia de las tablas
async function checkTables() {
  try {
    console.log('\nVerificando tablas en la base de datos...');
    
    // Lista de tablas que deberían existir
    const requiredTables = ['accounts', 'content', 'canvas'];
    
    // Verificar cada tabla
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ Tabla '${tableName}' no existe o no es accesible:`, error.message);
        } else {
          console.log(`✅ Tabla '${tableName}' existe`);
          
          // Verificar estructura de la tabla
          await checkTableStructure(tableName);
        }
      } catch (error) {
        console.error(`❌ Error al verificar tabla '${tableName}':`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  }
}

// Función para verificar la estructura de una tabla
async function checkTableStructure(tableName) {
  try {
    // Obtener una fila para ver la estructura
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`   Estructura de '${tableName}':`);
      const columns = Object.keys(data[0]);
      columns.forEach(column => {
        const value = data[0][column];
        const type = typeof value;
        console.log(`   - ${column} (${type})`);
      });
    } else {
      console.log(`   Tabla '${tableName}' está vacía`);
    }
  } catch (error) {
    console.error(`   ❌ Error al verificar estructura de '${tableName}':`, error.message);
  }
}

// Función principal
async function main() {
  console.log('=== Test de Conexión con Supabase ===\n');
  
  // Verificar conexión
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    // Verificar tablas
    await checkTables();
  }
  
  console.log('\n=== Fin del Test ===');
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
