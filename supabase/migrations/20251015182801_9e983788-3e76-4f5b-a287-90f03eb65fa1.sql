-- Crear tabla de donantes
CREATE TABLE public.donantes (
  documento VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  tipo_sangre VARCHAR(5),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear tabla de entidades médicas
CREATE TABLE public.entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear tabla de historias clínicas
CREATE TABLE public.historias_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES public.donantes(documento) ON DELETE CASCADE,
  edad INT,
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  enfermedades TEXT,
  medicamentos TEXT,
  transfusiones_previas BOOLEAN DEFAULT false,
  habitos_personales TEXT,
  observaciones TEXT,
  fecha_ultima_donacion DATE,
  estado VARCHAR(20) DEFAULT 'Pendiente',
  observaciones_medicas TEXT,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_revision TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de donaciones
CREATE TABLE public.donaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES public.donantes(documento) ON DELETE CASCADE,
  fecha_donacion DATE NOT NULL,
  cantidad_ml INT NOT NULL,
  centro VARCHAR(100),
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'Completada',
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de solicitudes de sangre
CREATE TABLE public.solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidad_id UUID REFERENCES public.entidades(id) ON DELETE CASCADE,
  tipo_sangre VARCHAR(5) NOT NULL,
  cantidad_ml INT NOT NULL,
  urgencia VARCHAR(20) NOT NULL,
  fecha_requerida DATE NOT NULL,
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'Pendiente',
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.donantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para donantes
CREATE POLICY "Donantes pueden ver su propio perfil"
  ON public.donantes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Donantes pueden actualizar su propio perfil"
  ON public.donantes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Entidades pueden ver todos los donantes"
  ON public.donantes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE user_id = auth.uid()));

CREATE POLICY "Cualquiera puede insertar donantes"
  ON public.donantes FOR INSERT
  WITH CHECK (true);

-- Políticas RLS para entidades
CREATE POLICY "Entidades pueden ver su propio perfil"
  ON public.entidades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Cualquiera puede insertar entidades"
  ON public.entidades FOR INSERT
  WITH CHECK (true);

-- Políticas RLS para historias clínicas
CREATE POLICY "Donantes pueden ver su propia historia"
  ON public.historias_clinicas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.donantes WHERE documento = documento_donante AND user_id = auth.uid()));

CREATE POLICY "Donantes pueden crear su historia"
  ON public.historias_clinicas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.donantes WHERE documento = documento_donante AND user_id = auth.uid()));

CREATE POLICY "Donantes pueden actualizar su historia"
  ON public.historias_clinicas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.donantes WHERE documento = documento_donante AND user_id = auth.uid()));

CREATE POLICY "Entidades pueden ver todas las historias"
  ON public.historias_clinicas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE user_id = auth.uid()));

CREATE POLICY "Entidades pueden actualizar historias"
  ON public.historias_clinicas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE user_id = auth.uid()));

-- Políticas RLS para donaciones
CREATE POLICY "Donantes pueden ver sus donaciones"
  ON public.donaciones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.donantes WHERE documento = documento_donante AND user_id = auth.uid()));

CREATE POLICY "Entidades pueden ver todas las donaciones"
  ON public.donaciones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE user_id = auth.uid()));

CREATE POLICY "Entidades pueden crear donaciones"
  ON public.donaciones FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.entidades WHERE user_id = auth.uid()));

-- Políticas RLS para solicitudes
CREATE POLICY "Entidades pueden ver sus solicitudes"
  ON public.solicitudes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE id = entidad_id AND user_id = auth.uid()));

CREATE POLICY "Entidades pueden crear solicitudes"
  ON public.solicitudes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.entidades WHERE id = entidad_id AND user_id = auth.uid()));

CREATE POLICY "Entidades pueden actualizar solicitudes"
  ON public.solicitudes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.entidades WHERE id = entidad_id AND user_id = auth.uid()));