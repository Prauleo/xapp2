# Backend para Generación de Contenido de Twitter

Este documento describe la implementación del backend para la generación de contenido de Twitter utilizando OpenAI y Supabase.

## Estructura del Proyecto

```
backend/
├── api/
│   ├── routes/
│   │   ├── index.js             # Configuración de rutas
│   │   └── twitter-content.js   # Rutas para Twitter
│   ├── controllers/
│   │   └── twitter-controller.js # Controlador para Twitter
│   ├── middleware/
│   │   ├── auth-middleware.js   # Middleware de autenticación
│   │   ├── rate-limiter.js      # Limitador de tasa
│   │   └── error-handler.js     # Manejador de errores
│   └── services/
│       ├── supabase.js          # Servicio de Supabase
│       └── openai.js            # Servicio de OpenAI
├── utils/
│   ├── validators.js            # Validadores
│   └── text-processors.js       # Procesadores de texto
└── prompt-engineering/
    └── twitter-prompts.js       # Templates para prompts de Twitter
```

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://dsvjabibiibfexunqmni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmphYmliaWliZmV4dW5xbW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjE5NjksImV4cCI6MjA1NjA5Nzk2OX0.wZ3TPvcP4CZQv9tF_oNNgfgxq7MW4PBB3hCc_TBs2Js
NEXT_PUBLIC_OPENAI_API_KEY=tu_clave_de_openai
```

### 2. Configuración de Supabase

1. Accede a [Supabase](https://app.supabase.com/) y crea un nuevo proyecto.
2. Una vez creado el proyecto, ve a la pestaña "SQL Editor".
3. Ejecuta el siguiente script SQL para crear las tablas necesarias:

```sql
-- Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Esquema para la tabla de cuentas
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram')),
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    profile_image_url TEXT,
    reference_content JSONB,
    lexical_profile JSONB,
    content_preferences JSONB,
    style_visual VARCHAR(255),
    tone VARCHAR(255),
    idioma VARCHAR(10) DEFAULT 'es',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Esquema para la tabla de contenido
CREATE TABLE public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES public.accounts(id) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram')),
    content_type VARCHAR(50) NOT NULL,
    main_idea TEXT,
    additional_context TEXT,
    generated_text TEXT,
    edited_text TEXT,
    image_prompt TEXT,
    image_url TEXT,
    narrative_info JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Esquema para la tabla de canvas narrativos
CREATE TABLE public.canvas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES public.accounts(id) NOT NULL,
    title VARCHAR(255),
    episodes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_content_account_id ON public.content(account_id);
CREATE INDEX idx_content_platform ON public.content(platform);
CREATE INDEX idx_canvas_account_id ON public.canvas(account_id);
```

4. Configura las políticas de seguridad (RLS) para proteger tus datos:

```sql
-- Políticas de seguridad para Row Level Security (RLS)
-- Habilitar RLS en las tablas
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas ENABLE ROW LEVEL SECURITY;

-- Política para accounts: los usuarios solo pueden ver y modificar sus propias cuentas
CREATE POLICY "Usuarios pueden ver sus propias cuentas" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias cuentas" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias cuentas" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias cuentas" ON public.accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Política para content: los usuarios solo pueden ver y modificar contenido de sus propias cuentas
CREATE POLICY "Usuarios pueden ver contenido de sus cuentas" ON public.content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = content.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden insertar contenido en sus cuentas" ON public.content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = content.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden actualizar contenido de sus cuentas" ON public.content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = content.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar contenido de sus cuentas" ON public.content
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = content.account_id
            AND accounts.user_id = auth.uid()
        )
    );

-- Política para canvas: los usuarios solo pueden ver y modificar canvas de sus propias cuentas
CREATE POLICY "Usuarios pueden ver canvas de sus cuentas" ON public.canvas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = canvas.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden insertar canvas en sus cuentas" ON public.canvas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = canvas.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden actualizar canvas de sus cuentas" ON public.canvas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = canvas.account_id
            AND accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar canvas de sus cuentas" ON public.canvas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.accounts
            WHERE accounts.id = canvas.account_id
            AND accounts.user_id = auth.uid()
        )
    );
```

## API Endpoints

### Twitter

#### Crear Contenido

- **URL**: `/api/twitter/create`
- **Método**: `POST`
- **Descripción**: Genera contenido para Twitter (tweet único o hilo)
- **Cuerpo de la Solicitud**:
  ```json
  {
    "accountId": "uuid-de-la-cuenta",
    "ideaPrincipal": "Idea principal para el tweet",
    "contextoAdicional": "Contexto adicional (opcional)",
    "esHilo": false
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "content": {
      "id": "uuid-del-contenido",
      "account_id": "uuid-de-la-cuenta",
      "platform": "twitter",
      "content_type": "tweet",
      "main_idea": "Idea principal para el tweet",
      "additional_context": "Contexto adicional",
      "generated_text": "JSON con las opciones generadas",
      "edited_text": "JSON con las opciones generadas",
      "status": "draft",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    "options": [
      {
        "tipo": "corto",
        "tweet": "Texto del tweet corto"
      },
      {
        "tipo": "medio",
        "tweet": "Texto del tweet medio"
      },
      {
        "tipo": "largo",
        "tweet": "Texto del tweet largo"
      }
    ]
  }
  ```

#### Obtener Contenido

- **URL**: `/api/twitter/:accountId`
- **Método**: `GET`
- **Descripción**: Obtiene el contenido de Twitter para una cuenta específica
- **Parámetros de Ruta**:
  - `accountId`: ID de la cuenta
- **Respuesta Exitosa**:
  ```json
  [
    {
      "id": "uuid-del-contenido",
      "account_id": "uuid-de-la-cuenta",
      "platform": "twitter",
      "content_type": "tweet",
      "main_idea": "Idea principal para el tweet",
      "additional_context": "Contexto adicional",
      "generated_text": "JSON con las opciones generadas",
      "edited_text": "JSON con las opciones generadas",
      "status": "draft",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

#### Analizar Tweet

- **URL**: `/api/twitter/analyze`
- **Método**: `POST`
- **Descripción**: Analiza un tweet para proporcionar sugerencias de mejora
- **Cuerpo de la Solicitud**:
  ```json
  {
    "tweetText": "Texto del tweet a analizar",
    "accountId": "uuid-de-la-cuenta"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "analisisGeneral": "Análisis general del tweet",
    "tonoVoz": "Análisis del tono y voz",
    "potencialEngagement": "Evaluación del potencial de engagement",
    "sugerencias": [
      "Sugerencia 1",
      "Sugerencia 2",
      "Sugerencia 3"
    ],
    "versionMejorada": "Versión mejorada del tweet"
  }
  ```

#### Actualizar Contenido

- **URL**: `/api/twitter/:contentId`
- **Método**: `PUT`
- **Descripción**: Actualiza el contenido de un tweet
- **Parámetros de Ruta**:
  - `contentId`: ID del contenido
- **Cuerpo de la Solicitud**:
  ```json
  {
    "editedText": "Texto editado del tweet",
    "status": "published"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "id": "uuid-del-contenido",
    "account_id": "uuid-de-la-cuenta",
    "platform": "twitter",
    "content_type": "tweet",
    "main_idea": "Idea principal para el tweet",
    "additional_context": "Contexto adicional",
    "generated_text": "JSON con las opciones generadas",
    "edited_text": "Texto editado del tweet",
    "status": "published",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
  ```

## Uso de la API

### Ejemplo de Creación de Contenido

```javascript
// Ejemplo de creación de un tweet
const response = await fetch('/api/twitter/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    accountId: 'uuid-de-la-cuenta',
    ideaPrincipal: 'Los beneficios de la meditación diaria',
    contextoAdicional: 'Enfocarse en la reducción del estrés y mejora del sueño',
    esHilo: false
  }),
});

const data = await response.json();
console.log(data.options); // Opciones de tweets generados
```

### Ejemplo de Análisis de Tweet

```javascript
// Ejemplo de análisis de un tweet
const response = await fetch('/api/twitter/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tweetText: 'La meditación diaria puede reducir el estrés y mejorar la calidad del sueño. ¡Prueba 10 minutos cada mañana!',
    accountId: 'uuid-de-la-cuenta'
  }),
});

const analysis = await response.json();
console.log(analysis.sugerencias); // Sugerencias de mejora
console.log(analysis.versionMejorada); // Versión mejorada del tweet
```

## Notas Importantes

1. **Autenticación**: Todas las rutas de la API están protegidas por autenticación. Asegúrate de que el usuario esté autenticado antes de hacer solicitudes.

2. **Límites de Tasa**: La API tiene límites de tasa para prevenir abusos:
   - Generación de contenido: 10 solicitudes por minuto
   - Análisis: 20 solicitudes por minuto
   - General: 60 solicitudes por minuto

3. **Manejo de Errores**: La API devuelve códigos de estado HTTP apropiados y mensajes de error descriptivos.

4. **Formato de Respuesta de Error**:
   ```json
   {
     "error": {
       "mensaje": "Mensaje de error",
       "detalles": "Detalles adicionales (solo en desarrollo)"
     }
   }
   ```

5. **Longitud de Tweets**: Los tweets están limitados a 280 caracteres. La API genera opciones de diferentes longitudes (corto, medio, largo) para dar más flexibilidad.

6. **Hilos de Tweets**: Para crear hilos, establece `esHilo: true` en la solicitud de creación. La API generará opciones de hilos con diferentes longitudes.

7. **No se usan hashtags**: Según los requisitos, la API no genera hashtags para los tweets.
