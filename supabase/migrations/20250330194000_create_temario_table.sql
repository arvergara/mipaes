-- Create temario table from PAES curriculum (must run first)
CREATE TABLE temario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,       -- CB, CF, CQ, H, L, M1, M2
  area TEXT NOT NULL,          -- Biologia, Fisica, Historia, etc.
  theme TEXT NOT NULL,         -- Herencia y evolucion, Electricidad, etc.
  subtheme TEXT NOT NULL,      -- Temas específicos
  dificultad INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_subject CHECK (subject IN ('CB', 'CF', 'CQ', 'H', 'L', 'M1', 'M2'))
);

-- Enable Row Level Security
ALTER TABLE temario ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_temario_subject ON temario(subject);
CREATE INDEX idx_temario_area ON temario(area);
