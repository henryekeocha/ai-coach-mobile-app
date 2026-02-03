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