// app/api/route.js
import { NextResponse } from 'next/server';
import apiRoutes from '../../api/routes';

// Manejador para todas las solicitudes a la API
export async function GET(request) {
  return handleApiRequest(request, 'GET');
}

export async function POST(request) {
  return handleApiRequest(request, 'POST');
}

export async function PUT(request) {
  return handleApiRequest(request, 'PUT');
}

export async function DELETE(request) {
  return handleApiRequest(request, 'DELETE');
}

/**
 * Función auxiliar para manejar solicitudes a la API
 * @param {Request} request - Objeto de solicitud
 * @param {string} method - Método HTTP
 * @returns {Promise<NextResponse>} - Respuesta de Next.js
 */
async function handleApiRequest(request, method) {
  try {
    // Extraer la ruta de la URL
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    
    // Crear un objeto de solicitud simulado para Express
    const req = {
      method,
      url: path,
      path,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(request.headers),
      ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      body: method !== 'GET' && method !== 'HEAD' ? await request.json() : {}
    };
    
    // Crear un objeto de respuesta simulado para Express
    let statusCode = 200;
    let responseBody = {};
    let responseHeaders = {};
    
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
        return res;
      },
      setHeader: (name, value) => {
        responseHeaders[name] = value;
        return res;
      },
      getHeader: (name) => responseHeaders[name],
      end: () => {}
    };
    
    // Buscar la ruta correspondiente en el router de Express
    const route = findRoute(apiRoutes, path, method);
    
    if (route) {
      // Ejecutar el manejador de la ruta
      await new Promise((resolve) => {
        route.handler(req, res, resolve);
      });
    } else {
      // Ruta no encontrada
      statusCode = 404;
      responseBody = {
        error: {
          mensaje: 'Ruta no encontrada',
          ruta: path
        }
      };
    }
    
    // Crear la respuesta de Next.js
    return NextResponse.json(responseBody, {
      status: statusCode,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error en la API:', error);
    
    // Devolver error 500 en caso de excepción
    return NextResponse.json(
      {
        error: {
          mensaje: 'Error interno del servidor',
          detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Función auxiliar para encontrar una ruta en el router de Express
 * @param {Object} router - Router de Express
 * @param {string} path - Ruta de la solicitud
 * @param {string} method - Método HTTP
 * @returns {Object|null} - Ruta encontrada o null
 */
function findRoute(router, path, method) {
  // Implementación simplificada para encontrar rutas
  // En una implementación real, se debería usar un sistema más robusto
  
  // Verificar ruta de estado
  if (path === '/status' && method === 'GET') {
    return {
      path: '/status',
      method: 'GET',
      handler: (req, res) => {
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0'
        });
      }
    };
  }
  
  // Verificar rutas de Twitter
  if (path.startsWith('/twitter')) {
    const subPath = path.replace(/^\/twitter/, '');
    
    // Ruta para crear contenido
    if (subPath === '/create' && method === 'POST') {
      return {
        path: '/twitter/create',
        method: 'POST',
        handler: async (req, res, next) => {
          try {
            const { createTwitterContent } = await import('../../api/controllers/twitter-controller');
            await createTwitterContent(req, res);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
          next();
        }
      };
    }
    
    // Ruta para obtener contenido
    if (subPath.match(/^\/[a-zA-Z0-9-]+$/) && method === 'GET') {
      return {
        path: '/twitter/:accountId',
        method: 'GET',
        handler: async (req, res, next) => {
          try {
            req.params = { accountId: subPath.substring(1) };
            const { getTwitterContent } = await import('../../api/controllers/twitter-controller');
            await getTwitterContent(req, res);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
          next();
        }
      };
    }
    
    // Ruta para analizar contenido
    if (subPath === '/analyze' && method === 'POST') {
      return {
        path: '/twitter/analyze',
        method: 'POST',
        handler: async (req, res, next) => {
          try {
            const { analyzeTwitterContent } = await import('../../api/controllers/twitter-controller');
            await analyzeTwitterContent(req, res);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
          next();
        }
      };
    }
    
    // Ruta para actualizar contenido
    if (subPath.match(/^\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
      return {
        path: '/twitter/:contentId',
        method: 'PUT',
        handler: async (req, res, next) => {
          try {
            req.params = { contentId: subPath.substring(1) };
            const { updateTwitterContent } = await import('../../api/controllers/twitter-controller');
            await updateTwitterContent(req, res);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
          next();
        }
      };
    }
  }
  
  return null;
}
