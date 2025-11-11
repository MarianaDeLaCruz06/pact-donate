-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('donante', 'entidad')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donantes table
CREATE TABLE IF NOT EXISTS donantes (
  documento VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  tipo_sangre VARCHAR(5),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create entidades table
CREATE TABLE IF NOT EXISTS entidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create historias_clinicas table
CREATE TABLE IF NOT EXISTS historias_clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES donantes(documento) ON DELETE CASCADE,
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
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_revision TIMESTAMP WITH TIME ZONE
);

-- Create donaciones table
CREATE TABLE IF NOT EXISTS donaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES donantes(documento) ON DELETE CASCADE,
  fecha_donacion DATE NOT NULL,
  cantidad_ml INT NOT NULL,
  centro VARCHAR(100),
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'Completada',
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solicitudes table
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
  tipo_sangre VARCHAR(5) NOT NULL,
  cantidad_ml INT NOT NULL,
  urgencia VARCHAR(20) NOT NULL,
  fecha_requerida DATE NOT NULL,
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'Pendiente',
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donantes_user_id ON donantes(user_id);
CREATE INDEX IF NOT EXISTS idx_entidades_user_id ON entidades(user_id);
CREATE INDEX IF NOT EXISTS idx_historias_documento ON historias_clinicas(documento_donante);
CREATE INDEX IF NOT EXISTS idx_donaciones_documento ON donaciones(documento_donante);
CREATE INDEX IF NOT EXISTS idx_solicitudes_entidad ON solicitudes(entidad_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_tipo_sangre ON solicitudes(tipo_sangre);

