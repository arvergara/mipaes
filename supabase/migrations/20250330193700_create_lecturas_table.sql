-- Create lecturas table
CREATE TABLE lecturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido TEXT NOT NULL,
  prueba_id TEXT NOT NULL REFERENCES pruebas(id),
  year INTEGER NOT NULL,
  dificultad INTEGER DEFAULT 1,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for preguntas_lecturas many-to-many relationship
CREATE TABLE preguntas_lecturas (
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  pregunta_id UUID NOT NULL REFERENCES preguntas(id),
  PRIMARY KEY (lectura_id, pregunta_id)
);

-- Enable Row Level Security
ALTER TABLE lecturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_lecturas ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_lecturas_prueba ON lecturas(prueba_id);
CREATE INDEX idx_preguntas_lecturas ON preguntas_lecturas(pregunta_id);
