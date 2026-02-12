# Technical Documentation

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Navigation Structure](#navigation-structure)
6. [State Management](#state-management)
7. [RevenueCat Implementation](#revenuecat-implementation)
8. [Tavus Integration](#tavus-integration)
9. [API & Edge Functions](#api--edge-functions)
10. [Design Patterns](#design-patterns)
11. [Security](#security)
12. [Development Workflow](#development-workflow)

---

## Tech Stack Overview

### Frontend

- **Framework**: React Native 0.81.4
- **Runtime**: Expo SDK 54.0.10
- **Navigation**: Expo Router 6.0.8 (file-based routing)
- **Language**: TypeScript 5.9.2
- **UI Components**: React Native core components
- **Icons**: Lucide React Native 0.544.0
- **Animations**: React Native Reanimated 4.1.1
- **Gestures**: React Native Gesture Handler 2.28.0

### Backend & Services

- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password)
- **Backend Functions**: Supabase Edge Functions (Deno runtime)
- **Payments**: RevenueCat 9.7.6 (iOS/Android subscriptions)
- **Video AI**: Tavus.io (AI video avatar generation)

### Development Tools

- **Build Tool**: Expo CLI
- **Type Checking**: TypeScript
- **Package Manager**: npm
- **Version Control**: Git

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile Client                           │
│                    (React Native/Expo)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │   Contexts   │      │
│  │  (Routes)    │  │  (Reusable)  │  │   (State)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Services Layer                       │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │      │
│  │  │ Supabase │  │RevenueCat│  │  Tavus   │      │      │
│  │  │  Client  │  │  Client  │  │  Client  │      │      │
│  │  └──────────┘  └──────────┘  └──────────┘      │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Auth     │  │     Edge     │      │
│  │   Database   │  │   Service    │  │  Functions   │      │
│  │    + RLS     │  │              │  │   (Deno)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌────────────────┐      ┌────────────────┐
       │   RevenueCat   │      │   Tavus.io     │
       │   (Payments)   │      │  (AI Video)    │
       └────────────────┘      └────────────────┘
```

### Directory Structure

```
project/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Discover coaches screen
│   │   ├── create.tsx            # Create coach screen
│   │   ├── conversations.tsx    # Conversations list screen
│   │   ├── profile.tsx           # User profile screen
│   │   └── subscription.tsx      # Subscription management screen
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx             # Login screen
│   │   └── signup.tsx            # Signup screen
│   ├── chat/[id].tsx             # Dynamic chat screen
│   ├── coach/[id].tsx            # Dynamic coach details screen
│   ├── _layout.tsx               # Root layout with auth routing
│   └── +not-found.tsx            # 404 screen
│
├── components/                   # Reusable UI components
│   ├── SessionRecap.tsx          # Session summary component
│   └── TextChat.tsx              # Chat interface component
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Authentication state management
│   └── SubscriptionContext.tsx  # Subscription state management
│
├── hooks/                        # Custom React hooks
│   ├── useFrameworkReady.ts     # Framework initialization hook
│   └── useSubscription.ts       # Subscription status hook
│
├── lib/                          # Shared utilities and clients
│   ├── supabase.ts              # Supabase client configuration
│   └── images.ts                # Image utilities
│
├── services/                     # External service integrations
│   ├── revenuecat.ts            # RevenueCat SDK wrapper
│   └── tavus.ts                 # Tavus API client
│
├── types/                        # TypeScript type definitions
│   ├── database.ts              # Database table types
│   └── env.d.ts                 # Environment variable types
│
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations (SQL)
│   └── functions/               # Edge functions (Deno)
│       ├── generate-coach-response/
│       └── generate-session-summary/
│
└── assets/                       # Static assets
    └── images/                  # Image files
```

### Design Patterns

#### 1. Context + Provider Pattern
Used for global state management (authentication, subscriptions).

```typescript
// Pattern: Context + Provider
<AuthProvider>
  <SubscriptionProvider>
    <App />
  </SubscriptionProvider>
</AuthProvider>
```

#### 2. Custom Hooks Pattern
Encapsulates complex logic and state management.

```typescript
// Pattern: Custom Hook
const { session, user, loading } = useAuth();
const { isPremium, isPro } = useSubscription();
```

#### 3. Service Layer Pattern
Abstracts external API calls and business logic.

```typescript
// Pattern: Service Layer
import { getCustomerInfo } from '@/services/revenuecat';
import { createTavusClient } from '@/services/tavus';
```

#### 4. File-Based Routing
Expo Router provides automatic routing based on file structure.

```typescript
// Pattern: File-based routing
app/(tabs)/index.tsx    → /(tabs)/
app/coach/[id].tsx      → /coach/:id
app/auth/login.tsx      → /auth/login
```

---

## Database Schema

### Tables Overview

```
user_profiles          ──┐
                         │
coaches               ──┼── conversations ── messages
                         │
coach_favorites       ──┘
```

### Table: `user_profiles`

Stores user profile information and personal context.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  background TEXT,
  goals TEXT,
  values TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can view their own profile
- Users can update their own profile

### Table: `coaches`

Stores AI coach profiles and configurations.

```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  approach TEXT,
  specialties TEXT[],
  personality_traits TEXT[],
  system_prompt TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT false,
  tavus_replica_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Authenticated users can view public coaches
- Users can view their own coaches
- Users can create coaches
- Users can update their own coaches
- Users can delete their own coaches

### Table: `conversations`

Stores chat sessions between users and coaches.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  title TEXT,
  last_message_at TIMESTAMPTZ,
  session_type TEXT DEFAULT 'chat',
  session_duration INTEGER,
  session_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can view their own conversations
- Users can create conversations
- Users can update their own conversations

### Table: `messages`

Stores individual messages in conversations.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can view messages in their own conversations
- Users can create messages in their own conversations

### Table: `coach_favorites`

Tracks user's favorite coaches.

```sql
CREATE TABLE coach_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, coach_id)
);
```

**RLS Policies**:
- Users can view their own favorites
- Users can create/delete their own favorites

---

## Authentication System

### Implementation: Supabase Auth

The app uses Supabase's built-in authentication system with email/password authentication.

### Authentication Flow

```
┌──────────────┐
│  User Opens  │
│     App      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Check Session Status │
│  (AuthContext init)  │
└──────┬───────────────┘
       │
       ├─── Session Exists ───► Redirect to /(tabs)
       │
       └─── No Session ───────► Redirect to /auth/login
```

### AuthContext Implementation

Location: `contexts/AuthContext.tsx`

**Responsibilities**:
- Manages authentication state
- Provides authentication methods
- Handles session persistence
- Triggers navigation based on auth state

**Key Features**:
```typescript
interface AuthContextType {
  session: Session | null;      // Current session
  user: User | null;             // Current user
  loading: boolean;              // Auth initialization status
  signUp: (email, password, displayName) => Promise;
  signIn: (email, password) => Promise;
  signOut: () => Promise;
}
```

**Auth State Listener**:
```typescript
// Safe async callback pattern to avoid deadlocks
supabase.auth.onAuthStateChange((event, session) => {
  (async () => {
    setSession(session);
    setUser(session?.user ?? null);
  })();
});
```

### Protected Routes

Location: `app/_layout.tsx`

```typescript
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');    // Not authenticated
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');        // Already authenticated
    }
  }, [session, loading, segments]);
}
```

### User Profile Creation

Automatic profile creation on signup via database trigger:

```sql
CREATE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Navigation Structure

### Tab-Based Navigation

The app uses Expo Router's tab navigation as the primary navigation structure.

**Tab Bar Configuration**: `app/(tabs)/_layout.tsx`

```typescript
<Tabs screenOptions={{ headerShown: false }}>
  <Tabs.Screen name="index" options={{ title: 'Discover' }} />
  <Tabs.Screen name="create" options={{ title: 'Create' }} />
  <Tabs.Screen name="conversations" options={{ title: 'Chats' }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  <Tabs.Screen name="subscription" options={{ title: 'Premium' }} />
</Tabs>
```

### Navigation Hierarchy

```
Root Layout (_layout.tsx)
│
├── Auth Group (auth/)
│   ├── Login
│   └── Signup
│
├── Tabs Group ((tabs)/)
│   ├── Discover (index)
│   ├── Create
│   ├── Conversations
│   ├── Profile
│   └── Subscription
│
├── Dynamic Routes
│   ├── Coach Details (coach/[id])
│   └── Chat (chat/[id])
│
└── 404 (+not-found)
```

### Programmatic Navigation

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to route
router.push('/coach/123');

// Navigate with replace (no back)
router.replace('/(tabs)');

// Go back
router.back();
```

---

## State Management

### Context-Based State

The app uses React Context for global state management.

#### 1. AuthContext

**Purpose**: Manages authentication state across the app.

**Location**: `contexts/AuthContext.tsx`

**Usage**:
```typescript
const { session, user, signIn, signOut } = useAuth();
```

#### 2. SubscriptionContext

**Purpose**: Manages subscription state and entitlements.

**Location**: `contexts/SubscriptionContext.tsx`

**Usage**:
```typescript
const { isPremium, isPro, loading } = useSubscription();
```

### Local State

Component-level state is managed with React hooks:
- `useState` - Component state
- `useEffect` - Side effects
- `useMemo` - Memoization
- `useCallback` - Function memoization

---

## RevenueCat Implementation

### Overview

RevenueCat handles subscription management, in-app purchases, and entitlements across iOS and Android.

### Architecture

```
Mobile App
    │
    ▼
RevenueCat Service (services/revenuecat.ts)
    │
    ├── Platform Check (iOS/Android/Web)
    │
    ▼
RevenueCat SDK (react-native-purchases)
    │
    ├── iOS ────► App Store Connect
    │
    └── Android ────► Google Play Console
```

### Service Implementation

**Location**: `services/revenuecat.ts`

**Key Functions**:

```typescript
// Initialize RevenueCat with user ID
initializeRevenueCat(userId: string): Promise<void>

// Fetch available subscription offerings
getOfferings(): Promise<PurchasesOfferings | null>

// Purchase a subscription package
purchasePackage(packageToPurchase): Promise<CustomerInfo>

// Get current customer info and entitlements
getCustomerInfo(): Promise<CustomerInfo>

// Restore previous purchases
restorePurchases(): Promise<CustomerInfo>
```

### Platform Compatibility

RevenueCat service includes web compatibility checks:

```typescript
if (Platform.OS === 'web' || !Purchases) {
  // Return mock data or skip operation
  return null;
}
```

This allows the app to:
- Run in web preview without errors
- Function on iOS/Android with full payment support
- Gracefully degrade on unsupported platforms

### Initialization

**Location**: `app/_layout.tsx`

```typescript
function RootLayoutNav() {
  const { user } = useAuth();

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (user) {
      initializeRevenueCat(user.id);
    }
  }, [user]);
}
```

### Subscription Hook

**Location**: `hooks/useSubscription.ts`

```typescript
export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const customerInfo = await getCustomerInfo();
    setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
    setIsPro(customerInfo.entitlements.active['pro'] !== undefined);
    setLoading(false);
  };

  return { isPremium, isPro, loading, refresh: checkSubscription };
};
```

### Subscription Screen

**Location**: `app/(tabs)/subscription.tsx`

Features:
- Display available subscription offerings
- Handle purchase flow
- Show current subscription status
- Restore purchases option
- Manage subscription (iOS/Android settings)

### Entitlement Gates

Use subscription status to gate features:

```typescript
const { isPremium } = useSubscription();

const handleFeature = () => {
  if (!isPremium) {
    router.push('/(tabs)/subscription');
    return;
  }
  // Execute premium feature
};
```

### Suggested Subscription Tiers

#### Free Tier
- Browse public coaches
- Create 1 coach
- 10 messages per day

#### Premium Tier ($9.99/month)
- Unlimited coaches
- Unlimited messages
- Video responses with Tavus
- Priority support

#### Pro Tier ($29.99/month)
- All Premium features
- White-label coaches
- API access
- Team collaboration

### Testing

**Development Testing**:
1. Export project locally
2. Create development build: `npx expo run:ios` or `npx expo run:android`
3. Use sandbox testing:
   - iOS: Sandbox Apple ID
   - Android: Test account in Google Play Console

**Important Notes**:
- RevenueCat requires native code
- Cannot test in web preview or Expo Go
- Must use development build or production build

### Configuration Steps

1. Create RevenueCat account
2. Set up iOS app in App Store Connect
3. Set up Android app in Google Play Console
4. Configure products in store consoles
5. Add products to RevenueCat dashboard
6. Link stores to RevenueCat
7. Add API keys to `.env`

---

## Tavus Integration

### Overview

Tavus.io provides AI-generated video avatars for a more engaging coaching experience.

### Service Implementation

**Location**: `services/tavus.ts`

**Key Features**:
- Create personas from video recordings
- Generate personalized video responses
- Poll video generation status
- List available personas

**Key Methods**:

```typescript
class TavusService {
  // Create AI persona from video
  createPersona(name: string, videoUrl: string): Promise<TavusPersona>

  // Generate video response from persona
  generateVideo(personaId: string, script: string): Promise<TavusVideoResponse>

  // Check video generation status
  getVideoStatus(videoId: string): Promise<TavusVideoResponse>

  // List all personas
  listPersonas(): Promise<TavusPersona[]>
}
```

### Integration Flow

```
1. Coach Setup
   ↓
   Record video → Upload to Tavus → Get persona_id
   ↓
   Store persona_id in coaches.tavus_replica_id

2. Chat Interaction
   ↓
   User sends message → Generate coach response (text)
   ↓
   Call Tavus.generateVideo(persona_id, response_text)
   ↓
   Poll getVideoStatus() until completed
   ↓
   Display video URL in chat
```

### Database Integration

Coaches table includes `tavus_replica_id`:

```sql
ALTER TABLE coaches
ADD COLUMN tavus_replica_id TEXT;
```

### Usage Example

```typescript
import { createTavusClient } from '@/services/tavus';

const tavus = createTavusClient(process.env.EXPO_PUBLIC_TAVUS_API_KEY);

// Generate video response
const videoResponse = await tavus.generateVideo(
  coach.tavus_replica_id,
  aiGeneratedText
);

// Store video URL in message metadata
await supabase.from('messages').insert({
  conversation_id: conversationId,
  role: 'assistant',
  content: aiGeneratedText,
  metadata: {
    video_url: videoResponse.video_url,
    video_status: videoResponse.status
  }
});
```

---

## API & Edge Functions

### Edge Functions Overview

Supabase Edge Functions run on Deno runtime and provide serverless API endpoints.

**Location**: `supabase/functions/`

### Function: `generate-coach-response`

**Purpose**: Generate AI responses from coaches based on system prompts.

**Location**: `supabase/functions/generate-coach-response/index.ts`

**API Endpoint**:
```
POST /functions/v1/generate-coach-response
```

**Request Body**:
```typescript
{
  coachId: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}
```

**Response**:
```typescript
{
  response: string;
  usage: {
    tokens: number;
  }
}
```

### Function: `generate-session-summary`

**Purpose**: Generate conversation summaries for session recaps.

**Location**: `supabase/functions/generate-session-summary/index.ts`

**API Endpoint**:
```
POST /functions/v1/generate-session-summary
```

**Request Body**:
```typescript
{
  conversationId: string;
}
```

**Response**:
```typescript
{
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}
```

### Calling Edge Functions

**From Frontend**:

```typescript
const response = await fetch(
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-coach-response`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coachId: coach.id,
      message: userMessage,
    }),
  }
);

const data = await response.json();
```

### CORS Configuration

All edge functions include CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Handle OPTIONS preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Include in all responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

---

## Design Patterns

### Component Patterns

#### 1. Screen Components
Full-page components that correspond to routes.

**Characteristics**:
- Located in `app/` directory
- Export default component
- Handle navigation and data fetching
- Use contexts for global state

#### 2. Reusable Components
Shared UI components used across screens.

**Characteristics**:
- Located in `components/` directory
- Accept props for customization
- Self-contained and reusable
- No direct navigation

#### 3. Context Providers
Wrap app to provide global state.

**Characteristics**:
- Located in `contexts/` directory
- Use React Context API
- Provide state and actions
- Handle side effects

### Service Patterns

#### API Service Layer
Abstracts external API calls.

**Benefits**:
- Centralized API logic
- Easy to mock for testing
- Type-safe interfaces
- Error handling consistency

**Example**:
```typescript
// services/revenuecat.ts
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  if (Platform.OS === 'web') {
    return mockCustomerInfo;
  }
  return await Purchases.getCustomerInfo();
};
```

### Hook Patterns

#### Custom Hooks
Encapsulate reusable logic.

**Characteristics**:
- Located in `hooks/` directory
- Prefix with `use`
- Return values and functions
- Handle side effects internally

**Example**:
```typescript
// hooks/useSubscription.ts
export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  return { isPremium, loading };
};
```

---

## Security

### Row Level Security (RLS)

All database tables use PostgreSQL Row Level Security to ensure data access control.

**Pattern**:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Authentication Security

- Passwords hashed by Supabase Auth
- Session tokens stored securely
- Automatic token refresh
- HTTPS-only communication

### API Key Security

Environment variables for sensitive keys:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_TAVUS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
- `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`

**Important**: `EXPO_PUBLIC_*` variables are exposed to client code. Never use for sensitive server-side keys.

### Edge Function Security

Edge functions can access server-side environment variables:
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side database access
- API keys for external services

These are NOT exposed to the client.

---

## Development Workflow

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Run on Device**:
   - Scan QR code with Expo Go (iOS/Android)
   - Open in browser (web preview)

### Testing RevenueCat

RevenueCat requires native code and cannot be tested in web preview or Expo Go.

**Steps**:
1. Export project:
   ```bash
   npx expo prebuild
   ```

2. Build for iOS:
   ```bash
   npx expo run:ios
   ```

3. Build for Android:
   ```bash
   npx expo run:android
   ```

### Database Migrations

**Create Migration**:
```bash
supabase migration new migration_name
```

**Apply Migration** (via Supabase MCP):
Use the `mcp__supabase__apply_migration` tool with migration SQL.

**Migration Best Practices**:
- Always include descriptive comments
- Use `IF EXISTS`/`IF NOT EXISTS`
- Never drop columns with data
- Always enable RLS on new tables
- Create restrictive policies by default

### Edge Function Development

**Local Testing**:
```bash
supabase functions serve function-name
```

**Deploy Function** (via Supabase MCP):
Use the `mcp__supabase__deploy_edge_function` tool.

### Type Safety

**Generate Database Types**:
```bash
supabase gen types typescript --local > types/database.ts
```

Update `types/database.ts` to match current schema.

### Building for Production

**Web Build**:
```bash
npm run build:web
```

**iOS Build**:
```bash
eas build --platform ios
```

**Android Build**:
```bash
eas build --platform android
```

---

## Summary

This app demonstrates a modern mobile architecture using:

- **Expo/React Native** for cross-platform mobile development
- **Supabase** for backend services (database, auth, edge functions)
- **RevenueCat** for subscription management
- **Tavus.io** for AI video avatars
- **TypeScript** for type safety
- **File-based routing** for intuitive navigation
- **Context API** for state management
- **Row Level Security** for data protection

The architecture is designed to be:
- **Scalable**: Serverless backend with edge functions
- **Secure**: RLS policies and authentication
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new features
- **Type-safe**: Full TypeScript coverage

For more details on specific features, refer to:
- `REVENUECAT_INTEGRATION.md` - RevenueCat setup and usage
- `TAVUS_INTEGRATION.md` - Tavus video integration
- `README.md` - Quick start guide
- Migration files in `supabase/migrations/` - Database schema details
