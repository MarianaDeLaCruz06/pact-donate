-- Migration for new features: inventory, notifications, and emergency button

-- Add inventory table to track blood stock by entity and blood type
CREATE TABLE IF NOT EXISTS inventario_sangre (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_id UUID NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
  tipo_sangre VARCHAR(5) NOT NULL,
  cantidad_ml INT NOT NULL DEFAULT 0,
  cantidad_unidades INT NOT NULL DEFAULT 0,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entidad_id, tipo_sangre)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventario_entidad ON inventario_sangre(entidad_id);
CREATE INDEX IF NOT EXISTS idx_inventario_tipo_sangre ON inventario_sangre(tipo_sangre);

-- Add notification preferences table for donors
CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES donantes(documento) ON DELETE CASCADE,
  recibir_notificaciones BOOLEAN DEFAULT true,
  solo_emergencias BOOLEAN DEFAULT false,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(documento_donante)
);

-- Add notifications table
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_donante VARCHAR(20) NOT NULL REFERENCES donantes(documento) ON DELETE CASCADE,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('solicitud', 'emergencia', 'sistema')),
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_lectura TIMESTAMP WITH TIME ZONE
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notificaciones_donante ON notificaciones(documento_donante);
CREATE INDEX IF NOT EXISTS idx_notificaciones_solicitud ON notificaciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);

-- Add emergency flag to solicitudes table
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS es_emergencia BOOLEAN DEFAULT false;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(200);

-- Add index for emergency requests
CREATE INDEX IF NOT EXISTS idx_solicitudes_emergencia ON solicitudes(es_emergencia);

-- Add ubicacion to entidades for location-based search
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(200);
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_entidades_ubicacion ON entidades(ciudad, departamento);

-- Add centro field to inventario to track which center the blood is at
ALTER TABLE inventario_sangre ADD COLUMN IF NOT EXISTS centro VARCHAR(100);

-- Create function to automatically update inventory when donation is registered
CREATE OR REPLACE FUNCTION actualizar_inventario_donacion()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_sangre VARCHAR(5);
  v_entidad_id UUID;
  v_cantidad_ml INT;
BEGIN
  -- Get blood type from donor
  SELECT tipo_sangre INTO v_tipo_sangre
  FROM donantes
  WHERE documento = NEW.documento_donante;
  
  -- Get entity_id from centro (assuming centro matches entidad nombre)
  SELECT id INTO v_entidad_id
  FROM entidades
  WHERE nombre = NEW.centro
  LIMIT 1;
  
  -- If we have both blood type and entity, update inventory
  IF v_tipo_sangre IS NOT NULL AND v_entidad_id IS NOT NULL THEN
    v_cantidad_ml := NEW.cantidad_ml;
    
    INSERT INTO inventario_sangre (entidad_id, tipo_sangre, cantidad_ml, cantidad_unidades, centro)
    VALUES (v_entidad_id, v_tipo_sangre, v_cantidad_ml, 1, NEW.centro)
    ON CONFLICT (entidad_id, tipo_sangre)
    DO UPDATE SET
      cantidad_ml = inventario_sangre.cantidad_ml + v_cantidad_ml,
      cantidad_unidades = inventario_sangre.cantidad_unidades + 1,
      fecha_actualizacion = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update inventory on donation
DROP TRIGGER IF EXISTS trigger_actualizar_inventario_donacion ON donaciones;
CREATE TRIGGER trigger_actualizar_inventario_donacion
  AFTER INSERT ON donaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_inventario_donacion();

