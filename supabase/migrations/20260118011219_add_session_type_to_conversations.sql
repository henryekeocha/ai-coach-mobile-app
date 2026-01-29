/*
  # Add session type to conversations

  1. Changes
    - Add `session_type` column to `conversations` table
      - Type: text with check constraint
      - Values: 'text' or 'video'
      - Default: 'text'
      - Not null
  
  2. Notes
    - This allows users to choose between text-based and video coaching sessions
    - Existing conversations will default to 'text' mode
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN session_type text NOT NULL DEFAULT 'text'
    CHECK (session_type IN ('text', 'video'));
  END IF;
END $$;