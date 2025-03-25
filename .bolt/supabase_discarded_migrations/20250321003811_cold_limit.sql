/*
  # Add question details to user sessions

  1. Changes
    - Add question_details column to store topic-level data if it doesn't exist
    - Add index for better query performance if it doesn't exist
    - Update RLS policies
*/

-- Add question details column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'question_details'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN question_details jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_sessions' AND indexname = 'idx_user_sessions_question_details'
  ) THEN
    CREATE INDEX idx_user_sessions_question_details ON user_sessions USING gin (question_details);
  END IF;
END $$;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Users can read own session details'
  ) THEN
    DROP POLICY "Users can read own session details" ON user_sessions;
  END IF;
END $$;

-- Create policy
CREATE POLICY "Users can read own session details"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);