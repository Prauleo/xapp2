# Guía para Probar la API de Generación de Contenido para Twitter

Esta guía te ayudará a probar la API de generación de contenido para Twitter utilizando diferentes herramientas.

## Requisitos Previos

Antes de comenzar, asegúrate de:

1. Haber configurado Supabase correctamente (ver `SUPABASE-SETUP.md`).
2. Haber configurado OpenAI correctamente (ver `OPENAI-SETUP.md`).
3. Tener el servidor de desarrollo en ejecución (`npm run dev`).

## 1. Probar con Postman

[Postman](https://www.postman.com/) es una herramienta popular para probar APIs.

### 1.1. Configurar Postman

1. Descarga e instala Postman desde [postman.com](https://www.postman.com/downloads/).
2. Crea una nueva colección llamada "AI Content Creator API".
3. Configura una variable de entorno para la URL base:
   - Nombre: `baseUrl`
   - Valor inicial: `http://localhost:3000/api`
   - Valor actual: `http://localhost:3000/api`

### 1.2. Probar la Autenticación

Para probar la autenticación, necesitarás obtener un token de acceso de Supabase:

1. En tu aplicación, implementa un endpoint temporal para obtener el token de acceso:

```javascript
// pages/api/get-token.js
import { NextResponse } from 'next/server';
import supabase from '../../api/services/supabase';

export async function GET(req) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }
  
  return NextResponse.json({
    token: session.access_token
  });
}
```

