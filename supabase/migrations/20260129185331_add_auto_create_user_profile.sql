/*
  # Auto-create User Profile on Signup

  ## Changes
  
  This migration adds a database trigger that automatically creates a user profile
  when a new user signs up through Supabase Auth.

  1. **New Function**
     - `handle_new_user()` - Creates a user_profiles record for new auth.users
  
  2. **New Trigger**
     - Fires after INSERT on auth.users
     - Automatically creates matching profile with user's email as display name
  
  ## Security
  
  No RLS changes needed - existing policies cover the new records
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, core_values)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();