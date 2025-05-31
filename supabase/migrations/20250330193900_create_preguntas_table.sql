-- Create preguntas table for question bank
CREATE TABLE preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido TEXT NOT NULL,
  opcion_a TEXT NOT NULL,
  opcion_b TEXT NOT NULL,
  opcion_c TEXT NOT NULL,
  opcion_d TEXT NOT NULL,
  opcion_e TEXT,
  respuesta_correcta TEXT NOT NULL,
  explicacion TEXT,
  dificultad INTEGER DEFAULT 1,
  materia TEXT NOT NULL,
  temario_id UUID REFERENCES temario(id),
  prueba_id TEXT REFERENCES pruebas(id),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_respuesta CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D', 'E')),
  CONSTRAINT valid_materia CHECK (materia IN ('M1', 'M2', 'L', 'C', 'H'))
);

-- Enable Row Level Security
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_preguntas_materia ON preguntas(materia);
CREATE INDEX idx_preguntas_temario ON preguntas(temario_id);
CREATE INDEX idx_preguntas_prueba ON preguntas(prueba_id);
