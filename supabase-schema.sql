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
