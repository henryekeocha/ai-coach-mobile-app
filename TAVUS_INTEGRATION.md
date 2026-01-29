# Tavus.io Integration Guide

This app is designed to integrate with Tavus.io for human-in-AI video coaching experiences. Tavus allows you to create AI-powered video avatars that can deliver personalized coaching messages.

## What is Tavus?

Tavus.io enables you to create realistic AI video avatars from a short video recording. These avatars can then generate personalized video messages using AI, making your coaching experience more engaging and human.

## Getting Started with Tavus

1. **Sign up for Tavus**
   - Visit [https://www.tavus.io](https://www.tavus.io)
   - Create an account and get your API key

2. **Add your API key to the environment**
   - Open `.env` file
   - Add: `EXPO_PUBLIC_TAVUS_API_KEY=your_api_key_here`

3. **Update environment types**
   - Open `types/env.d.ts`
   - Add `EXPO_PUBLIC_TAVUS_API_KEY: string;` to the interface

## How It Works

### 1. Creating a Coach Persona

When creating a coach in the app, you can optionally link a Tavus persona:

```typescript
import { createTavusClient } from '@/services/tavus';

const tavus = createTavusClient(process.env.EXPO_PUBLIC_TAVUS_API_KEY!);

const persona = await tavus.createPersona(
  'Coach Sarah',
  'https://your-video-url.com/recording.mp4'
);

const coach = await supabase.from('coaches').insert({
  name: 'Coach Sarah',
  tavus_persona_id: persona.persona_id,
});
```

### 2. Generating Video Responses

In the chat interface, you can generate video responses from your coach:

```typescript
import { createTavusClient } from '@/services/tavus';

const tavus = createTavusClient(process.env.EXPO_PUBLIC_TAVUS_API_KEY!);

const videoResponse = await tavus.generateVideo(
  coach.tavus_persona_id,
  aiGeneratedResponse,
  { conversation_id: conversationId }
);

await supabase.from('messages').insert({
  conversation_id: conversationId,
  sender_type: 'coach',
  content: aiGeneratedResponse,
  metadata: {
    video_id: videoResponse.video_id,
    video_url: videoResponse.video_url,
  },
});
```

### 3. Displaying Video Messages

Update the chat message renderer to show video when available:

```typescript
import { Video } from 'expo-av';

const renderMessage = ({ item }: { item: Message }) => {
  const hasVideo = item.metadata?.video_url;

  return (
    <View style={styles.messageBubble}>
      {hasVideo && (
        <Video
          source={{ uri: item.metadata.video_url }}
          style={styles.videoPlayer}
          useNativeControls
          shouldPlay={false}
        />
      )}
      <Text>{item.content}</Text>
    </View>
  );
};
```

## Implementation Checklist

- [ ] Sign up for Tavus.io and get API key
- [ ] Add API key to environment variables
- [ ] Update coach creation screen to optionally upload a video for persona creation
- [ ] Integrate video generation in chat responses
- [ ] Update message component to display video content
- [ ] Add loading states while videos are being generated
- [ ] Handle video generation errors gracefully
- [ ] Consider adding a toggle to enable/disable video responses per conversation

## Best Practices

1. **Video Generation Time**: Video generation can take 30-60 seconds. Show appropriate loading states.

2. **Fallback to Text**: Always include text content alongside video, as video generation may fail.

3. **Cost Management**: Video generation has costs. Consider:
   - Limiting video responses to premium users
   - Allowing users to toggle video on/off
   - Using text-only mode by default

4. **Persona Quality**: The quality of the input video affects the avatar quality:
   - Use well-lit, high-quality video
   - Record in a quiet environment
   - Face the camera directly
   - Keep recording 2-5 minutes long

## Resources

- Tavus API Documentation: [https://docs.tavus.io](https://docs.tavus.io)
- Tavus Dashboard: [https://platform.tavus.io](https://platform.tavus.io)
- Support: support@tavus.io

## Notes

The database schema already includes a `tavus_persona_id` field in the coaches table and supports video metadata in the messages table, so you're ready to integrate Tavus without any schema changes.
