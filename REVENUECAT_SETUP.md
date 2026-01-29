# RevenueCat Integration Setup

## Overview
This guide will help you integrate RevenueCat for in-app subscriptions and purchases in your coaching app.

## Important Note
RevenueCat requires native code and will NOT work in Bolt's browser preview. You must:
1. Export your project to your local machine (Cursor, VS Code, etc.)
2. Install the RevenueCat SDK locally
3. Create a development build with Expo Dev Client to test

## Step 1: Install RevenueCat SDK

After exporting your project locally, run:

```bash
npx expo install react-native-purchases
```

## Step 2: Configure RevenueCat

### 2.1 Add API Keys to .env

Add your RevenueCat API keys to your `.env` file:

```
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_apple_api_key
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=your_google_api_key
```

### 2.2 Update Environment Types

The environment types have already been updated in `types/env.d.ts` to include these keys.

## Step 3: Configure in RevenueCat Dashboard

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new project or select existing
3. Add your app:
   - **iOS**: Add your Bundle ID from `app.json`
   - **Android**: Add your Package Name from `app.json`
4. Set up products and offerings in the dashboard
5. Create an offering called "premium" with your subscription tiers

## Step 4: Product Configuration

### Recommended Subscription Tiers

Create these products in App Store Connect and Google Play Console:

1. **Monthly Premium** - `premium_monthly`
   - Price: $9.99/month
   - Full access to all coaches
   - Unlimited video sessions
   - Priority support

2. **Yearly Premium** - `premium_yearly`
   - Price: $79.99/year (save 33%)
   - Full access to all coaches
   - Unlimited video sessions
   - Priority support
   - 7-day free trial

## Step 5: Test Your Integration

After installing the SDK and adding your API keys:

```bash
# Create a development build
npx expo run:ios
# or
npx expo run:android
```

## Step 6: Entitlement Checks

The app is configured to check for a "premium" entitlement. Users with this entitlement get:
- Access to all coaches
- Unlimited video sessions
- No ads or restrictions

## Useful Links

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [Expo + RevenueCat Guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Testing Subscriptions](https://www.revenuecat.com/docs/test-and-launch/sandbox-testing)

## Support

For issues with RevenueCat integration:
1. Check the [RevenueCat Community](https://community.revenuecat.com/)
2. Review [Common Issues Guide](https://www.revenuecat.com/docs/troubleshooting-the-sdks)
