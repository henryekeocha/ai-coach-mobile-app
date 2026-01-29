import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  showPaywall: () => void;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  isLoading: true,
  showPaywall: () => {},
  restorePurchases: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      setIsPremium(true);
      return;
    }

    try {
      setIsLoading(false);
      setIsPremium(true);
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
      setIsLoading(false);
    }
  };

  const showPaywall = () => {
    console.log('Show paywall');
  };

  const restorePurchases = async () => {
    try {
      console.log('Restore purchases');
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        isLoading,
        showPaywall,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
