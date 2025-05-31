-- Create pruebas table to reference PDF test files
CREATE TABLE pruebas (
  id TEXT PRIMARY KEY, -- Using PDF filename as ID (e.g. "L-2024-1.pdf")
  nombre TEXT NOT NULL,
  year INTEGER NOT NULL,
  subject TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_subject CHECK (subject IN ('M1', 'M2', 'L', 'C', 'H'))
);

-- Enable Row Level Security
ALTER TABLE pruebas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to pruebas
CREATE POLICY "Enable public read access to pruebas"
  ON pruebas
  FOR SELECT
  USING (true);
