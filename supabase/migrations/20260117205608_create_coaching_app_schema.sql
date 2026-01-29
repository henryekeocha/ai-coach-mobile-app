/*
  # AI Coaching App Schema

  ## Overview
  Complete database schema for an AI coaching mobile app where users can browse,
  create, share, and chat with AI coaches.

  ## New Tables

  ### `user_profiles`
  Stores user information, personal context, and values for personalized coaching
  - `id` (uuid, primary key) - Links to auth.users
  - `display_name` (text) - User's display name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `personal_context` (text, nullable) - User's background, goals, challenges
  - `core_values` (text[], nullable) - Array of user's core values
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### `coaches`
  Stores AI coach profiles with their specialties and configuration
  - `id` (uuid, primary key) - Unique coach identifier
  - `creator_id` (uuid, foreign key) - User who created this coach
  - `name` (text) - Coach's name
  - `title` (text) - Coach's title/expertise
  - `description` (text) - Detailed coach bio and approach
  - `avatar_url` (text, nullable) - Coach profile image
  - `specialties` (text[]) - Areas of expertise
  - `personality_traits` (text[]) - Coaching style attributes
  - `system_prompt` (text) - AI system instructions
  - `tavus_persona_id` (text, nullable) - Tavus.io persona ID for video
  - `is_public` (boolean) - Whether coach is discoverable by others
  - `use_count` (integer) - Number of times used
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `conversations`
  Tracks chat sessions between users and coaches
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, foreign key) - User in conversation
  - `coach_id` (uuid, foreign key) - Coach in conversation
  - `title` (text) - Conversation title/summary
  - `last_message_at` (timestamptz) - Timestamp of last message
  - `created_at` (timestamptz) - Conversation start time

  ### `messages`
  Stores individual messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - Parent conversation
  - `sender_type` (text) - Either 'user' or 'coach'
  - `content` (text) - Message text content
  - `metadata` (jsonb, nullable) - Additional data (audio, video links, etc.)
  - `created_at` (timestamptz) - Message timestamp

  ### `coach_favorites`
  Tracks which coaches users have favorited
  - `user_id` (uuid, foreign key) - User who favorited
  - `coach_id` (uuid, foreign key) - Favorited coach
  - `created_at` (timestamptz) - When favorited
  - Primary key on (user_id, coach_id)

  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profiles
  - Users can create coaches and manage their own
  - Public coaches are viewable by all authenticated users
  - Users can only access their own conversations and messages
  - Favorites are private to each user
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  personal_context text,
  core_values text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  avatar_url text,
  specialties text[] DEFAULT '{}',
  personality_traits text[] DEFAULT '{}',
  system_prompt text NOT NULL,
  tavus_persona_id text,
  is_public boolean DEFAULT true,
  use_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'New Conversation',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'coach')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create coach_favorites table
CREATE TABLE IF NOT EXISTS coach_favorites (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, coach_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coaches_creator ON coaches(creator_id);
CREATE INDEX IF NOT EXISTS idx_coaches_public ON coaches(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_coach ON conversations(coach_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for coaches
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
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can delete own coaches"
  ON coaches FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for coach_favorites
CREATE POLICY "Users can view own favorites"
  ON coach_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON coach_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON coach_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());