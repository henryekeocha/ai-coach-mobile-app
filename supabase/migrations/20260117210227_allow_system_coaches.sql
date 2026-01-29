/*
  # Allow System Coaches

  ## Overview
  Modify the coaches table to allow NULL creator_id for system-created sample coaches.
  This enables us to provide pre-built coaches for new users to explore.

  ## Changes
  1. Make creator_id nullable
  2. Update RLS policies to handle NULL creator_id
  3. System coaches (NULL creator_id) are read-only for all users
*/

-- Make creator_id nullable
ALTER TABLE coaches ALTER COLUMN creator_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public coaches" ON coaches;
DROP POLICY IF EXISTS "Users can create coaches" ON coaches;
DROP POLICY IF EXISTS "Creators can update own coaches" ON coaches;
DROP POLICY IF EXISTS "Creators can delete own coaches" ON coaches;

-- Recreate policies with system coach support
CREATE POLICY "Anyone can view public coaches"
  ON coaches FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create coaches"
  ON coaches FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own coaches"
  ON coaches FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() AND creator_id IS NOT NULL)
  WITH CHECK (creator_id = auth.uid() AND creator_id IS NOT NULL);

CREATE POLICY "Creators can delete own coaches"
  ON coaches FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() AND creator_id IS NOT NULL);