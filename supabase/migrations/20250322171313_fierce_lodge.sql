/*
  # Add question feedback system

  1. New Tables
    - `question_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question_id` (uuid, references questions)
      - `feedback_type` (text) - Type of feedback (error, improvement, etc.)
      - `content` (text) - Feedback description
      - `status` (text) - Status of the feedback (pending, reviewed, approved, rejected)
      - `created_at` (timestamp)
      - `reviewed_at` (timestamp)
      - `reviewed_by` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for users to submit feedback
    - Add policies for admins to review feedback
*/

CREATE TABLE IF NOT EXISTS question_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  question_id uuid REFERENCES questions NOT NULL,
  feedback_type text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users,

  CONSTRAINT valid_feedback_type CHECK (feedback_type IN ('error', 'improvement', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX idx_question_feedback_user_id ON question_feedback(user_id);
CREATE INDEX idx_question_feedback_question_id ON question_feedback(question_id);
CREATE INDEX idx_question_feedback_status ON question_feedback(status);
CREATE INDEX idx_question_feedback_created_at ON question_feedback(created_at);

-- Enable RLS
ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can create feedback"
  ON question_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON question_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for admins
CREATE POLICY "Admins can read all feedback"
  ON question_feedback
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update feedback"
  ON question_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');