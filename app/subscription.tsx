import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { getOfferings, purchasePackage, PurchasesOfferings } from '@/services/revenuecat';

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
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }

    const currentOffering = offerings?.current;

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Upgrade to Premium</Text>
                <Text style={styles.webNotice}>
                    In-app purchases are only available on iOS and Android devices.
                    To test subscriptions, export your project and run it on a native device.
                </Text>
                <View style={styles.package}>
                    <Text style={styles.packageTitle}>Premium Monthly</Text>
                    <Text style={styles.packagePrice}>$9.99/month</Text>
                </View>
                <View style={styles.package}>
                    <Text style={styles.packageTitle}>Premium Yearly</Text>
                    <Text style={styles.packagePrice}>$99.99/year</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            {currentOffering?.availablePackages.map((pkg) => (
                <TouchableOpacity
                    key={pkg.identifier}
                    style={styles.package}
                    onPress={() => handlePurchase(pkg)}
                >
                    <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                    <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 24,
        textAlign: 'center',
    },
    package: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    packagePrice: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    webNotice: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
});
