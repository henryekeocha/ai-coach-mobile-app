import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Coach } from '@/types/database';
import { Search, Star } from 'lucide-react-native';
import { getImageSource } from '@/lib/images';

export default function DiscoverScreen() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCoaches();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCoaches();
    }, [])
  );

  const loadCoaches = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    }

    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('is_public', true)
        .order('use_count', { ascending: false });

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadCoaches(true);
  };

  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCoach = ({ item }: { item: Coach }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() => router.push(`/coach/${item.id}`)}
    >
      <View style={styles.coachHeader}>
        {getImageSource(item.avatar_url) ? (
          <Image source={getImageSource(item.avatar_url)!} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{item.name}</Text>
          <Text style={styles.coachTitle}>{item.title}</Text>
        </View>
        <View style={styles.useCount}>
          <Star size={16} color="#fbbf24" />
          <Text style={styles.useCountText}>{item.use_count}</Text>
        </View>
      </View>

      <Text style={styles.coachDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.specialties}>
        {item.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {item.specialties.length > 3 && (
          <Text style={styles.moreTag}>+{item.specialties.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Coaches</Text>
        <Text style={styles.subtitle}>Find the perfect coach for your journey</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search coaches..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCoaches}
        renderItem={renderCoach}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No coaches found</Text>
            <Text style={styles.emptySubtext}>Try creating your own coach!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  coachInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  coachTitle: {
    fontSize: 14,
    color: '#666',
  },
  useCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  useCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  coachDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  moreTag: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    paddingVertical: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
