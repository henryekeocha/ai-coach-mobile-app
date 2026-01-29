# Pricing & Subscription Configuration

## Overview
Your coaching app now has a complete subscription system with two pricing tiers using RevenueCat.

## Pricing Tiers

### 1. Monthly Premium - $9.99/month
- Full access to all coaches
- Unlimited text sessions
- Video sessions included
- Priority support
- Cancel anytime
- Product ID: `premium_monthly`

### 2. Yearly Premium - $79.99/year (Save 33%)
- Everything in Monthly plan
- **7-day free trial**
- Save $40 per year
- Early access to new features
- Exclusive content
- Product ID: `premium_yearly`
- **RECOMMENDED** tier (marked with "BEST VALUE" badge)

## What You've Got

### 1. Subscription Screen (`app/(tabs)/subscription.tsx`)
- Beautiful pricing UI with two tiers
- Shows all features for each plan
- Displays savings badge on yearly plan
- Premium member status screen
- Restore purchases functionality
- Integrates with RevenueCat (when SDK is installed)

### 2. Subscription Context (`contexts/SubscriptionContext.tsx`)
- Manages subscription state throughout the app
- Provides `isPremium` status
- Handles subscription checks
- Ready for RevenueCat SDK integration

### 3. Premium Tab
- Added to bottom navigation with Crown icon
- Accessible from any screen
- Shows current subscription status

## Next Steps to Enable Purchases

### Step 1: Export Your Project
This app requires native code for RevenueCat. You must:
1. Download/export this project to your local machine
2. Open it in Cursor, VS Code, or your preferred editor

### Step 2: Install RevenueCat SDK
```bash
npx expo install react-native-purchases
```

### Step 3: Add Your API Keys
In your `.env` file, uncomment and add your RevenueCat API keys:
```
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_apple_api_key
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=your_google_api_key
```

### Step 4: Configure Products in App Stores

#### Apple App Store Connect
1. Create in-app purchase products:
   - `premium_monthly` - Auto-renewable subscription - $9.99/month
   - `premium_yearly` - Auto-renewable subscription - $79.99/year with 7-day free trial

#### Google Play Console
1. Create subscription products:
   - `premium_monthly` - $9.99/month
   - `premium_yearly` - $79.99/year with 7-day free trial

### Step 5: Set Up RevenueCat Dashboard
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a project
3. Link your Apple and Google apps
4. Create an offering called "premium"
5. Add both products to the offering

### Step 6: Build & Test
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Features Included

### For Users
- Clear pricing comparison
- Visual indicators for recommended plan
- Easy subscription management
- Restore purchases option
- Premium status display

### For You (Developer)
- Easy to modify pricing
- Simple to add more tiers
- Built-in subscription checks
- Ready for entitlement logic

## Customization

### Change Pricing
Edit `app/(tabs)/subscription.tsx`:
```typescript
const PRICING_TIERS: PricingTier[] = [
  {
    id: 'premium_monthly',
    price: '$9.99',  // Change this
    // ... other fields
  },
  // ...
];
```

### Add More Tiers
Add new objects to the `PRICING_TIERS` array with:
- Unique ID
- Price and period
- Features list
- Optional recommended badge

### Modify Premium Benefits
Edit the features arrays in the tier definitions to add/remove benefits.

## Testing

### Test Subscriptions
- iOS: Use sandbox test accounts
- Android: Use test tracks and license testing accounts
- RevenueCat provides sandbox mode for testing

### Check Premium Status
The `useSubscription()` hook provides:
- `isPremium` - Boolean for subscription status
- `isLoading` - Boolean while checking status
- `showPaywall()` - Function to show subscription screen
- `restorePurchases()` - Function to restore previous purchases

## Support Resources

- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **Expo + RevenueCat**: https://www.revenuecat.com/docs/getting-started/installation/expo
- **Testing Guide**: https://www.revenuecat.com/docs/test-and-launch/sandbox-testing
- **Community**: https://community.revenuecat.com/

## Notes

- Subscriptions only work on native iOS/Android (not in browser)
- RevenueCat handles receipt validation automatically
- All prices should match what's configured in App Store Connect and Google Play
- The app currently grants premium access to all users in web mode for development
