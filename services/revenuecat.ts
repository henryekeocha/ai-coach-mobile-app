import { Platform } from 'react-native';

// Web-compatible types
export interface PurchasesOfferings {
    current: any;
}

export interface CustomerInfo {
    entitlements: {
        active: Record<string, any>;
    };
}

// Only import on native platforms
let Purchases: any = null;
if (Platform.OS !== 'web') {
    try {
        Purchases = require('react-native-purchases').default;
    } catch (e) {
        console.warn('react-native-purchases not available');
    }
}

export const initializeRevenueCat = async (userId: string) => {
    if (Platform.OS === 'web' || !Purchases) {
        return;
    }

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
    if (Platform.OS === 'web' || !Purchases) {
        return null;
    }

    try {
        const offerings = await Purchases.getOfferings();
        return offerings;
    } catch (error) {
        console.error('Error fetching offerings:', error);
        return null;
    }
};

export const purchasePackage = async (packageToPurchase: any): Promise<CustomerInfo> => {
    if (Platform.OS === 'web' || !Purchases) {
        throw new Error('Purchases not available on web');
    }

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
    if (Platform.OS === 'web' || !Purchases) {
        return {
            entitlements: {
                active: {}
            }
        };
    }
    return await Purchases.getCustomerInfo();
};

export const restorePurchases = async (): Promise<CustomerInfo> => {
    if (Platform.OS === 'web' || !Purchases) {
        return {
            entitlements: {
                active: {}
            }
        };
    }
    return await Purchases.restorePurchases();
};