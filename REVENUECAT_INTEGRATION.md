# RevenueCat Integration Guide

This app is designed to use RevenueCat for managing subscriptions and in-app purchases. RevenueCat simplifies mobile subscription management across iOS and Android platforms.

## Why RevenueCat?

RevenueCat handles:
- Subscription billing
- Receipt validation
- Cross-platform user management
- Analytics and insights
- Webhook integrations
- Customer support tools

## Important: Native Code Required

RevenueCat requires native code and will NOT work in the browser preview. To integrate RevenueCat, you must:

1. **Export this project** from the browser
2. **Open it locally** in a code editor (VS Code, Cursor, etc.)
3. **Install RevenueCat SDK** using the steps below
4. **Build a development build** using Expo Dev Client

## Getting Started

### Step 1: Create a RevenueCat Account

1. Sign up at [https://www.revenuecat.com](https://www.revenuecat.com)
2. Create a new project in the RevenueCat dashboard
3. Get your API keys (Public SDK key)

### Step 2: Install RevenueCat SDK

After exporting the project and opening it locally, run:

```bash
npm install react-native-purchases
npx expo prebuild
```

### Step 3: Configure Environment Variables

Add to your `.env` file:

```
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_ios_key_here
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_android_key_here
```

Update `types/env.d.ts`:

```typescript
interface ProcessEnv {
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: string;
  EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: string;
}
```

### Step 4: Initialize RevenueCat

Create `services/revenuecat.ts`:

```typescript
import Purchases, { PurchasesOfferings, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

export const initializeRevenueCat = async (userId: string) => {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
  });

  if (!apiKey) {
    throw new Error('RevenueCat API key not configured');
  }

  Purchases.configure({ apiKey, appUserID: userId });
};

export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: any): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Error purchasing package:', error);
    }
    throw error;
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  return await Purchases.getCustomerInfo();
};

export const restorePurchases = async (): Promise<CustomerInfo> => {
  return await Purchases.restorePurchases();
};
```

### Step 5: Initialize in App

Update `app/_layout.tsx` to initialize RevenueCat:

```typescript
import { initializeRevenueCat } from '@/services/revenuecat';

function RootLayoutNav() {
  const { session, loading, user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeRevenueCat(user.id);
    }
  }, [user]);

  // ... rest of component
}
```

### Step 6: Create Subscription Screen

Create `app/subscription.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getOfferings, purchasePackage } from '@/services/revenuecat';
import { PurchasesOfferings } from 'react-native-purchases';

export default function SubscriptionScreen() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const offers = await getOfferings();
    setOfferings(offers);
    setLoading(false);
  };

  const handlePurchase = async (pkg: any) => {
    try {
      const customerInfo = await purchasePackage(pkg);
      if (customerInfo.entitlements.active['premium']) {
        // User now has access to premium features
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  const currentOffering = offerings?.current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      {currentOffering?.availablePackages.map((pkg) => (
        <TouchableOpacity
          key={pkg.identifier}
          style={styles.package}
          onPress={() => handlePurchase(pkg)}
        >
          <Text>{pkg.product.title}</Text>
          <Text>{pkg.product.priceString}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## Suggested Subscription Tiers

### Free Tier
- Browse public coaches
- Create 1 coach
- 10 messages per day

### Premium Tier ($9.99/month)
- Unlimited coaches
- Unlimited messages
- Video responses with Tavus
- Priority support
- Advanced analytics

### Pro Tier ($29.99/month)
- Everything in Premium
- White-label coaches
- API access
- Team collaboration

## Entitlement Checking

Create `hooks/useSubscription.ts`:

```typescript
import { useState, useEffect } from 'react';
import { getCustomerInfo } from '@/services/revenuecat';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const customerInfo = await getCustomerInfo();
      setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
      setIsPro(customerInfo.entitlements.active['pro'] !== undefined);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isPremium, isPro, loading, refresh: checkSubscription };
};
```

Use in components:

```typescript
import { useSubscription } from '@/hooks/useSubscription';

function ChatScreen() {
  const { isPremium } = useSubscription();

  const handleSendMessage = () => {
    if (!isPremium && messageCount >= 10) {
      // Show upgrade prompt
      router.push('/subscription');
      return;
    }
    // Send message
  };
}
```

## App Store Configuration

### iOS (App Store Connect)
1. Create app in App Store Connect
2. Configure in-app purchases
3. Add products to RevenueCat dashboard
4. Link App Store Connect to RevenueCat

### Android (Google Play Console)
1. Create app in Google Play Console
2. Configure in-app products
3. Add products to RevenueCat dashboard
4. Link Google Play to RevenueCat

## Testing

RevenueCat provides sandbox environments for testing:

1. **iOS**: Use sandbox Apple ID
2. **Android**: Use test account in Google Play Console
3. **Both**: Create test users in RevenueCat dashboard

## Webhook Integration

RevenueCat can notify your backend about subscription events:

1. Set up webhook URL in RevenueCat dashboard
2. Create an edge function to handle webhooks:

```typescript
// supabase/functions/revenuecat-webhook/index.ts
export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === 'INITIAL_PURCHASE') {
    // Update user's premium status
  }

  return new Response('OK', { status: 200 });
}
```

## Resources

- RevenueCat Documentation: [https://www.revenuecat.com/docs](https://www.revenuecat.com/docs)
- Expo Integration: [https://www.revenuecat.com/docs/getting-started/installation/expo](https://www.revenuecat.com/docs/getting-started/installation/expo)
- Dashboard: [https://app.revenuecat.com](https://app.revenuecat.com)

## Next Steps

1. Export this project and open locally
2. Install RevenueCat SDK
3. Create development build: `npx expo run:ios` or `npx expo run:android`
4. Configure products in App Store/Play Store
5. Set up products in RevenueCat dashboard
6. Test purchases in sandbox mode
7. Deploy to production

## Important Notes

- RevenueCat requires native code and will NOT work in web preview
- You must create a development build to test purchases
- Testing requires actual devices or simulators (not web)
- Always test in sandbox mode before going to production
