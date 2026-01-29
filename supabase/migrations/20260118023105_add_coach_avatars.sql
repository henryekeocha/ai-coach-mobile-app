/*
  # Add Coach Avatar URLs

  ## Overview
  Updates the existing sample coaches to include avatar URLs from Pexels.

  ## Changes
  - Sets avatar_url for Alex Rivera (productivity coach)
  - Sets avatar_url for Maya Chen (leadership coach) 
  - Sets avatar_url for Jordan Taylor (wellness coach)

  ## Note
  Using high-quality professional headshots from Pexels for realistic coach profiles.
*/

UPDATE coaches
SET avatar_url = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE coaches
SET avatar_url = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE coaches
SET avatar_url = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE id = '33333333-3333-3333-3333-333333333333';