import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Crown, Check, Sparkles } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'premium_monthly',
    name: 'Monthly',
    price: '$9.99',
    period: 'per month',
    description: 'Perfect for getting started',
    features: [
      'Access to all coaches',
      'Unlimited text sessions',
      'Video sessions included',
      'Priority support',
      'Cancel anytime',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Yearly',
    price: '$79.99',
    period: 'per year',
    description: 'Best value for committed users',
    recommended: true,
    savings: 'Save 33%',
    features: [
      'Everything in Monthly',
      '7-day free trial',
      'Save $40 per year',
      'Early access to new features',
      'Exclusive content',
    ],
  },
];

export default function SubscriptionScreen() {
  const { isPremium, restorePurchases } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string>('premium_yearly');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      Alert.alert(
        'RevenueCat Required',
        'To enable purchases, please export this project and install the RevenueCat SDK locally. See REVENUECAT_SETUP.md for instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else if (Platform.OS === 'android') {
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      } else {
        Alert.alert(
          'Manage Subscription',
          'To manage your subscription, please visit the App Store or Google Play Store on your mobile device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Open Settings',
        'Please manually open your device settings to manage subscriptions.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Premium Active</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.premiumCard}>
            <View style={styles.premiumIconContainer}>
              <Crown size={48} color="#fbbf24" />
            </View>
            <Text style={styles.premiumTitle}>You're a Premium Member</Text>
            <Text style={styles.premiumDescription}>
              Enjoy unlimited access to all coaches and features
            </Text>

            <View style={styles.featuresContainer}>
              {[
                'Unlimited coaching sessions',
                'Access to all premium coaches',
                'Video sessions included',
                'Priority support',
                'Early access to new features',
              ].map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={20} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Unlock unlimited coaching</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.benefitsSection}>
          <View style={styles.benefitCard}>
            <Sparkles size={24} color="#fbbf24" />
            <Text style={styles.benefitText}>All Premium Coaches</Text>
          </View>
          <View style={styles.benefitCard}>
            <Sparkles size={24} color="#fbbf24" />
            <Text style={styles.benefitText}>Unlimited Sessions</Text>
          </View>
          <View style={styles.benefitCard}>
            <Sparkles size={24} color="#fbbf24" />
            <Text style={styles.benefitText}>Video Coaching</Text>
          </View>
        </View>

        {PRICING_TIERS.map((tier) => (
          <TouchableOpacity
            key={tier.id}
            style={[
              styles.tierCard,
              selectedTier === tier.id && styles.tierCardSelected,
              tier.recommended && styles.tierCardRecommended,
            ]}
            onPress={() => setSelectedTier(tier.id)}
          >
            {tier.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>BEST VALUE</Text>
              </View>
            )}

            <View style={styles.tierHeader}>
              <View>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierDescription}>{tier.description}</Text>
              </View>
              <View style={styles.tierPricing}>
                <Text style={styles.tierPrice}>{tier.price}</Text>
                <Text style={styles.tierPeriod}>{tier.period}</Text>
                {tier.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{tier.savings}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tierFeatures}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Crown size={20} color="#fff" />
              <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
        >
          <Text style={styles.restoreButtonText}>
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Subscription automatically renews unless auto-renew is turned off at least 24
          hours before the end of the current period. Payment will be charged to your
          account at confirmation of purchase.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  benefitsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
    marginTop: 8,
  },
  tierCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  tierCardRecommended: {
    borderColor: '#fbbf24',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
  },
  tierPricing: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  tierPeriod: {
    fontSize: 12,
    color: '#666',
  },
  savingsBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  tierFeatures: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  premiumCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fef3c7',
    marginBottom: 24,
  },
  premiumIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
  },
  manageButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
