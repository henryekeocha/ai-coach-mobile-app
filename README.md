# AI Coaching App

A beautiful, minimal mobile app for discovering, creating, and chatting with personalized AI coaches. Built with Expo, React Native, and Supabase.

## Features

- **Discover Coaches**: Browse and search through a curated collection of AI coaches
- **Create Custom Coaches**: Design your own AI coaching personas with unique specialties and personalities
- **Real-time Chat**: Engage in meaningful conversations with AI coaches
- **Personal Context**: Add your goals, values, and context for personalized guidance
- **Video Integration**: Ready for Tavus.io integration to bring coaches to life with AI-generated video
- **Subscription System**: Built-in support for RevenueCat monetization

## Tech Stack

- **Frontend**: React Native with Expo SDK
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React Native
- **Navigation**: Expo Router
- **Video (Optional)**: Tavus.io for AI video avatars
- **Payments (Optional)**: RevenueCat for subscriptions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo account (optional, for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. The app is already configured with Supabase. The environment variables are in `.env`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open in Expo Go app or web browser

## Project Structure

```
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Discover coaches
│   │   ├── create.tsx       # Create coach
│   │   ├── conversations.tsx # Chat list
│   │   └── profile.tsx      # User profile
│   ├── auth/                # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── coach/[id].tsx       # Coach details
│   └── chat/[id].tsx        # Chat interface
├── components/              # Reusable components
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication state
├── hooks/                   # Custom hooks
├── lib/                     # Libraries and utilities
│   └── supabase.ts          # Supabase client
├── services/                # External service integrations
│   └── tavus.ts             # Tavus.io integration
├── types/                   # TypeScript type definitions
│   ├── database.ts          # Database types
│   └── env.d.ts             # Environment types
└── README.md
```

## Database Schema

The app uses the following main tables:

- **user_profiles**: User information and personal context
- **coaches**: AI coach profiles and configurations
- **conversations**: Chat sessions between users and coaches
- **messages**: Individual messages in conversations
- **coach_favorites**: User's favorite coaches

All tables have Row Level Security (RLS) enabled for data protection.

## Key Features Explained

### Coach Creation

Users can create custom AI coaches by defining:
- Name and title
- Description and approach
- Specialties (e.g., productivity, leadership)
- Personality traits
- System prompt for AI behavior
- Public/private visibility

### Personal Context

Users can add:
- Display name
- Personal background and goals
- Core values
- This context helps coaches provide more relevant guidance

### Chat System

- Real-time messaging interface
- Messages stored in Supabase
- AI responses generated based on coach's system prompt
- Support for metadata (video links, attachments)

## Optional Integrations

### Tavus.io (Video Avatars)

See `TAVUS_INTEGRATION.md` for complete setup instructions.

Tavus enables human-in-AI experiences with:
- AI video avatars from real coach recordings
- Personalized video responses
- More engaging coaching sessions

### RevenueCat (Subscriptions)

See `REVENUECAT_INTEGRATION.md` for complete setup instructions.

RevenueCat enables:
- Subscription management
- In-app purchases
- Cross-platform support
- Analytics and insights

**Note**: RevenueCat requires native code and won't work in web preview. You'll need to export the project and build locally.

## Design Philosophy

This app follows a clean, minimal design approach:

- **Black & White**: Primary color scheme for professional, timeless look
- **Generous Spacing**: 8px spacing system for breathing room
- **Clear Typography**: Font size hierarchy for readability
- **Subtle Interactions**: Smooth transitions and feedback
- **Mobile-First**: Optimized for mobile with keyboard handling

## Environment Variables

Required variables (already configured):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Optional variables:
- `EXPO_PUBLIC_TAVUS_API_KEY` (for video integration)
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` (for subscriptions)
- `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` (for subscriptions)

## Building for Production

### Web
```bash
npm run build:web
```

### iOS/Android

To build native apps, you'll need to:

1. Export the project:
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

## Future Enhancements

Potential features to add:
- Voice messaging
- Group coaching sessions
- Coach analytics dashboard
- Advanced search and filters
- Recommended coaches
- Social sharing
- Progress tracking
- Goal setting and reminders

## Contributing

This is a starter template. Feel free to customize and extend it for your needs.

## License

MIT

## Support

For issues or questions, please refer to:
- Expo Documentation: https://docs.expo.dev
- Supabase Documentation: https://supabase.com/docs
- Tavus Documentation: https://docs.tavus.io
- RevenueCat Documentation: https://www.revenuecat.com/docs
