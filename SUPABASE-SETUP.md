# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para el proyecto de generación de contenido para Twitter.

## 1. Crear una Cuenta en Supabase

1. Ve a [Supabase](https://app.supabase.com/) y regístrate o inicia sesión.
2. Una vez dentro del dashboard, haz clic en "New Project".

## 2. Crear un Nuevo Proyecto

1. Completa la información del proyecto:
   - **Name**: Nombre de tu proyecto (por ejemplo, "AI Content Creator")
   - **Database Password**: Crea una contraseña segura para la base de datos
   - **Region**: Selecciona la región más cercana a ti
   - **Pricing Plan**: Free tier (para desarrollo)

2. Haz clic en "Create new project".
3. Espera a que se aprovisione el proyecto (esto puede tardar unos minutos).

## 3. Obtener las Credenciales de la API

1. Una vez creado el proyecto, ve a "Settings" > "API" en el menú lateral.
2. Aquí encontrarás:
   - **URL**: La URL de tu proyecto de Supabase
   - **anon public**: La clave anónima para acceso público
   - **service_role**: La clave de servicio (¡mantén esta clave segura!)

3. Copia la URL y la clave anónima (anon public) para usarlas en tu archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 4. Configurar la Base de Datos

### 4.1. Habilitar la Extensión UUID

1. Ve a la pestaña "SQL Editor" en el menú lateral.
2. Crea una nueva consulta haciendo clic en "New query".
3. Pega el siguiente código SQL:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

4. Haz clic en "Run" para ejecutar la consulta.

### 4.2. Crear las Tablas

1. Crea una nueva consulta.
2. Pega el siguiente código SQL para crear las tablas necesarias:

```sql
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

3. Haz clic en "Run" para ejecutar la consulta.

### 4.3. Configurar Políticas de Seguridad (RLS)

1. Crea una nueva consulta.
2. Pega el siguiente código SQL para configurar las políticas de seguridad:

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

3. Haz clic en "Run" para ejecutar la consulta.

## 5. Configurar Autenticación

### 5.1. Configurar Proveedores de Autenticación

1. Ve a "Authentication" > "Providers" en el menú lateral.
2. Habilita los proveedores que desees usar (por ejemplo, Email, Google, etc.).
3. Para Google:
   - Habilita el proveedor
   - Configura el ID de cliente y el secreto de cliente de Google
   - Configura la URL de redirección: `https://tu-proyecto.supabase.co/auth/v1/callback`

### 5.2. Configurar Correos Electrónicos

1. Ve a "Authentication" > "Email Templates" en el menú lateral.
2. Personaliza las plantillas de correo electrónico según tus necesidades.

## 6. Verificar la Configuración

1. Ve a "Table Editor" en el menú lateral.
2. Deberías ver las tablas que has creado: `accounts`, `content` y `canvas`.
3. Puedes hacer clic en cada tabla para ver su estructura.

## 7. Configurar el Cliente de Supabase en tu Aplicación

1. Instala las dependencias necesarias:

```bash
npm install @supabase/supabase-js
```

2. Crea un archivo `.env.local` en la raíz de tu proyecto con las credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://dsvjabibiibfexunqmni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmphYmliaWliZmV4dW5xbW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjE5NjksImV4cCI6MjA1NjA5Nzk2OX0.wZ3TPvcP4CZQv9tF_oNNgfgxq7MW4PBB3hCc_TBs2Js
NEXT_PUBLIC_OPENAI_API_KEY=tu_clave_de_openai
```

3. Reinicia tu servidor de desarrollo para que los cambios surtan efecto.

## 8. Probar la Conexión

Para probar que la conexión con Supabase funciona correctamente, puedes crear un usuario de prueba y verificar que puedes acceder a los datos.

1. Ve a "Authentication" > "Users" en el menú lateral.
2. Haz clic en "Create user".
3. Completa la información del usuario y haz clic en "Create".
4. Usa este usuario para iniciar sesión en tu aplicación y verificar que puedes acceder a los datos.

## Solución de Problemas Comunes

### Error: "No se puede conectar a la base de datos"

- Verifica que las credenciales en `.env.local` sean correctas.
- Asegúrate de que el proyecto de Supabase esté activo.

### Error: "No se puede autenticar"

- Verifica que el proveedor de autenticación esté configurado correctamente.
- Asegúrate de que la URL de redirección sea correcta.

### Error: "No se pueden insertar datos"

- Verifica que las políticas de seguridad (RLS) estén configuradas correctamente.
- Asegúrate de que el usuario esté autenticado antes de intentar insertar datos.

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.io/docs)
- [Guía de autenticación de Supabase](https://supabase.io/docs/guides/auth)
- [Guía de Row Level Security (RLS) de Supabase](https://supabase.io/docs/guides/auth/row-level-security)
