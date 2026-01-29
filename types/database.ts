export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  personal_context?: string;
  core_values: string[];
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  creator_id: string;
  name: string;
  title: string;
  description: string;
  avatar_url?: string;
  specialties: string[];
  personality_traits: string[];
  system_prompt: string;
  tavus_persona_id?: string;
  tavus_replica_id?: string;
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  coach_id: string;
  title: string;
  session_type: 'text' | 'video';
  status: 'active' | 'archived';
  session_summary?: string;
  session_number: number;
  last_message_at: string;
  created_at: string;
  coach?: Coach;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'coach';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CoachFavorite {
  user_id: string;
  coach_id: string;
  created_at: string;
}
