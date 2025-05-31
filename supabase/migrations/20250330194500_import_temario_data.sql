-- Import data from temario_paes_vf.csv into temario table
-- Note: This must be run AFTER the temario table is created
-- Execute from Supabase SQL editor or via psql client

BEGIN;

-- Temporary table to load CSV data
CREATE TEMP TABLE temp_temario_import (
  subject TEXT,
  area TEXT,
  theme TEXT,
  subtheme TEXT
);

-- Load data from CSV (adjust path as needed)
COPY temp_temario_import FROM '/Users/alfil/Desktop/project/temario_paes_vf.csv' 
WITH (FORMAT csv, DELIMITER E'\t', HEADER true);

-- Insert into main table with additional fields
INSERT INTO temario (subject, area, theme, subtheme, dificultad, activo)
SELECT 
  subject,
  area,
  theme,
  subtheme,
  1 AS dificultad, -- Default difficulty
  true AS activo   -- Default active
FROM temp_temario_import;

-- Clean up
DROP TABLE temp_temario_import;

COMMIT;

-- Verify import
SELECT COUNT(*) AS total_imported FROM temario;
