/*
  # Add Tavus Replica ID to Coaches Table

  1. Changes
    - Add `tavus_replica_id` column to `coaches` table
      - Stores the Tavus replica ID for conversational AI features
      - Nullable text field to support coaches without Tavus integration
  
  2. Notes
    - This field works alongside `tavus_persona_id` to fully integrate with Tavus.io
    - No data migration needed as this is a new optional field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaches' AND column_name = 'tavus_replica_id'
  ) THEN
    ALTER TABLE coaches ADD COLUMN tavus_replica_id text;
  END IF;
END $$;