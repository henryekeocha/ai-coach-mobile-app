# Demo Mode Guide

Demo mode allows you to test premium features without needing to set up RevenueCat or make actual purchases. This is perfect for testing the app's functionality in the browser preview.

## What is Demo Mode?

Demo mode is a special development mode that grants premium access to all features, including:
- Unlimited text chat sessions
- Video coaching sessions with Tavus
- Access to all premium coaches
- No message limits

## How to Enable Demo Mode

Demo mode is controlled by an environment variable in your `.env` file:

```
EXPO_PUBLIC_DEMO_MODE=true
```

To disable demo mode and test the free tier experience, change it to:

```
EXPO_PUBLIC_DEMO_MODE=false
```

After changing the value, you'll need to restart the development server for changes to take effect.

## Testing Premium Features

With demo mode enabled, you can:

1. **Access the Subscription Tab**
   - Navigate to the Subscription tab
   - You'll see "DEMO MODE ACTIVE" badge
   - All premium features are unlocked

2. **Test Video Sessions**
   - Go to any coach profile (e.g., Alex Rivera, Jordan Taylor, Maya Chen)
   - Click "Start Coaching Session"
   - Select "Video Session"
   - The video session will start using Tavus integration

3. **Unlimited Messaging**
   - Start text chat sessions without message limits
   - No upgrade prompts will appear

## Testing the Paywall (Free Tier)

To test the paywall experience:

1. Set `EXPO_PUBLIC_DEMO_MODE=false` in `.env`
2. Restart the dev server
3. Try to:
   - Start a video session → You'll see the premium paywall
   - Send more than 10 messages in a text chat → You'll hit the message limit

## Production Deployment

**Important:** Before deploying to production:

1. Set `EXPO_PUBLIC_DEMO_MODE=false` in your production environment
2. Configure RevenueCat with real API keys
3. Set up proper subscription products in App Store Connect and Google Play Console

Demo mode should NEVER be enabled in production as it bypasses all payment requirements.

## How It Works

When demo mode is enabled:
- `SubscriptionContext` sets `isPremium = true` automatically
- All subscription checks pass without requiring actual purchases
- The subscription screen displays a "DEMO MODE ACTIVE" badge to indicate testing mode
