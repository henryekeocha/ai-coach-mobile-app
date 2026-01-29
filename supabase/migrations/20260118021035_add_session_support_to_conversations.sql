/*
  # Add Session Support to Conversations

  ## Overview
  Transform conversations from single infinite threads to session-based chats.
  Each coach can have multiple text sessions, but only one active session at a time.

  ## Changes

  ### 1. Conversations Table Modifications
    - Add `status` column (text):
      - Values: 'active' or 'archived'
      - Default: 'active'
      - Tracks whether a session is ongoing or completed
    
    - Add `session_summary` column (text, nullable):
      - Stores AI-generated summary of previous session
      - Shown when starting a new session
      - Helps provide context continuity
    
    - Add `session_number` column (integer):
      - Auto-incrementing session counter per coach per user
      - Default: 1
      - Helps users identify sessions chronologically

  ### 2. Indexes
    - Add index on status for faster filtering
    - Add composite index on (user_id, coach_id, status) for finding active sessions

  ### 3. Constraints
    - Ensure only one active session per user per coach using a unique partial index

  ### 4. Data Migration
    - Archive older conversations, keeping only the most recent one active per user per coach

  ## Security
    - No RLS changes needed (existing policies still apply)

  ## Notes
    - Existing conversations will be processed: most recent stays active, older ones archived
    - Users can archive sessions manually or when starting new ones
    - Session summaries are generated via edge function
*/

-- Add status column to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'status'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived'));
  END IF;
END $$;

-- Add session_summary column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'session_summary'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN session_summary text;
  END IF;
END $$;

-- Add session_number column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'session_number'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN session_number integer DEFAULT 1;
  END IF;
END $$;

-- Archive older conversations, keeping only the most recent one active per user per coach
UPDATE conversations
SET status = 'archived'
WHERE id IN (
  SELECT c1.id
  FROM conversations c1
  INNER JOIN (
    SELECT user_id, coach_id, MAX(last_message_at) as max_date
    FROM conversations
    WHERE status = 'active'
    GROUP BY user_id, coach_id
    HAVING COUNT(*) > 1
  ) c2 ON c1.user_id = c2.user_id AND c1.coach_id = c2.coach_id
  WHERE c1.last_message_at < c2.max_date
  AND c1.status = 'active'
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Create composite index for finding active sessions
CREATE INDEX IF NOT EXISTS idx_conversations_user_coach_status 
  ON conversations(user_id, coach_id, status);

-- Create unique partial index to ensure only one active session per user per coach
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_one_active_per_user_coach
  ON conversations(user_id, coach_id)
  WHERE status = 'active';