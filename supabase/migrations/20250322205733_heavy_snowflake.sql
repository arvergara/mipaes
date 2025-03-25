/*
  # Update subject constraints for science versions

  1. Changes
    - Split science subject (C) into specific versions (CB, CF, CQ)
    - Update constraints to match new subject codes
    - Ensure data consistency

  2. Security
    - Maintain existing RLS policies
    - Update indexes for new subject codes
*/

-- First drop all constraints that could interfere with the update
ALTER TABLE questions DROP CONSTRAINT IF EXISTS valid_subject;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS valid_subject_structure;
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS valid_subject;
ALTER TABLE question_attempts DROP CONSTRAINT IF EXISTS valid_subject;

-- Now update the data
UPDATE questions
SET subject = CASE
  WHEN area_tematica = 'Biología' THEN 'CB'
  WHEN area_tematica = 'Física' THEN 'CF'
  WHEN area_tematica = 'Química' THEN 'CQ'
  ELSE subject
END
WHERE subject = 'C';

UPDATE user_sessions
SET subject = CASE
  WHEN subject = 'C' THEN 'CB'  -- Default to Biology if no specific area
  ELSE subject
END;

UPDATE question_attempts
SET subject = CASE
  WHEN area_tematica = 'Biología' THEN 'CB'
  WHEN area_tematica = 'Física' THEN 'CF'
  WHEN area_tematica = 'Química' THEN 'CQ'
  ELSE subject
END
WHERE subject = 'C';

-- Add new constraints after data is updated
ALTER TABLE questions ADD CONSTRAINT valid_subject CHECK (
  subject IN ('M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H')
);

ALTER TABLE user_sessions ADD CONSTRAINT valid_subject CHECK (
  subject IN ('M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H', 'ALL')
);

ALTER TABLE question_attempts ADD CONSTRAINT valid_subject CHECK (
  subject IN ('M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H', 'ALL')
);

-- Update subject structure constraint
ALTER TABLE questions ADD CONSTRAINT valid_subject_structure CHECK (
  (subject = 'M1' AND area_tematica IN (
    'Números',
    'Álgebra y Funciones',
    'Geometría',
    'Probabilidad y Estadística'
  )) OR
  (subject = 'M2' AND area_tematica IN (
    'Números',
    'Álgebra y Funciones',
    'Geometría',
    'Probabilidad y Estadística'
  )) OR
  (subject = 'L' AND area_tematica IN (
    'Localizar',
    'Interpretar',
    'Evaluar'
  )) OR
  (subject IN ('CB') AND area_tematica = 'Biología') OR
  (subject IN ('CF') AND area_tematica = 'Física') OR
  (subject IN ('CQ') AND area_tematica = 'Química') OR
  (subject = 'H' AND area_tematica IN (
    'Historia Universal',
    'Historia de Chile',
    'Geografía'
  ))
);

-- Create or update indexes for better query performance
DROP INDEX IF EXISTS idx_questions_subject;
CREATE INDEX idx_questions_subject ON questions(subject);

DROP INDEX IF EXISTS idx_user_sessions_subject;
CREATE INDEX idx_user_sessions_subject ON user_sessions(subject);

DROP INDEX IF EXISTS idx_question_attempts_subject;
CREATE INDEX idx_question_attempts_subject ON question_attempts(subject);