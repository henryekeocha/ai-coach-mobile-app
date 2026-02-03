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