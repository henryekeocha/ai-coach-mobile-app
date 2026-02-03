import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Coach } from '@/types/database';
import { ArrowLeft, MessageCircle, Star, Video } from 'lucide-react-native';
import { getImageSource } from '@/lib/images';
import SessionRecap from '@/components/SessionRecap';

interface PendingSession {
  coachId: string;
  sessionType: 'text' | 'video';
  previousSessionId?: string;
  sessionNumber: number;
}

export default function CoachDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    if (id) {
      loadCoach();
    }
  }, [id]);

  const loadCoach = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCoach(data);
    } catch (error) {
      console.error('Error loading coach:', error);
      Alert.alert('Error', 'Failed to load coach details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (sessionType: 'text' | 'video') => {
    if (!coach || !user) return;

    setShowSessionModal(false);
    setStartingChat(true);

    try {
      const { data: existingActive } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('coach_id', coach.id)
        .eq('session_type', sessionType)
        .eq('status', 'active')
        .maybeSingle();

      if (existingActive) {
        await supabase
          .from('conversations')
          .update({ status: 'archived' })
          .eq('id', existingActive.id);
      }

      const { data: prevSession } = await supabase
        .from('conversations')
        .select('id, session_number')
        .eq('user_id', user.id)
        .eq('coach_id', coach.id)
        .eq('session_type', sessionType)
        .order('session_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSessionNumber = prevSession ? prevSession.session_number + 1 : 1;

      setPendingSession({
        coachId: coach.id,
        sessionType,
        previousSessionId: prevSession?.id,
        sessionNumber: nextSessionNumber,
      });

      if (prevSession && nextSessionNumber > 1) {
        setShowRecap(true);
      } else {
        createNewSession(coach.id, sessionType, nextSessionNumber);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setStartingChat(false);
    }
  };

  const createNewSession = async (
    coachId: string,
    sessionType: 'text' | 'video',
    sessionNumber: number,
    sessionSummary?: string
  ) => {
    try {
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          coach_id: coachId,
          title: `Session ${sessionNumber}`,
          session_type: sessionType,
          status: 'active',
          session_number: sessionNumber,
          session_summary: sessionSummary || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (coach) {
        await supabase.from('coaches').update({ use_count: coach.use_count + 1 }).eq('id', coach.id);
      }

      router.push(`/chat/${newConversation.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setStartingChat(false);
    }
  };

  const handleRecapDismiss = () => {
    setShowRecap(false);
    if (pendingSession) {
      createNewSession(
        pendingSession.coachId,
        pendingSession.sessionType,
        pendingSession.sessionNumber
      );
    }
    setPendingSession(null);
  };

  const handleRecapAccept = (summary: string) => {
    setShowRecap(false);
    if (pendingSession) {
      createNewSession(
        pendingSession.coachId,
        pendingSession.sessionType,
        pendingSession.sessionNumber,
        summary
      );
    }
    setPendingSession(null);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!coach) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Coach not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coach Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {getImageSource(coach.avatar_url) ? (
            <Image source={getImageSource(coach.avatar_url)!} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{coach.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{coach.name}</Text>
          <Text style={styles.title}>{coach.title}</Text>
          <View style={styles.stats}>
            <Star size={16} color="#fbbf24" />
            <Text style={styles.statsText}>{coach.use_count} sessions</Text>
          </View>
          <View style={styles.availableSessionsContainer}>
            <View style={styles.sessionBadge}>
              <MessageCircle size={14} color="#10b981" />
              <Text style={styles.sessionBadgeText}>Text Chat</Text>
            </View>
            {coach.tavus_replica_id && (
              <View style={styles.sessionBadge}>
                <Video size={14} color="#10b981" />
                <Text style={styles.sessionBadgeText}>Video Sessions</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{coach.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.tags}>
            {coach.specialties.map((specialty, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {coach.personality_traits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality Traits</Text>
            <View style={styles.tags}>
              {coach.personality_traits.map((trait, index) => (
                <View key={index} style={styles.traitTag}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.chatButton, startingChat && styles.chatButtonDisabled]}
          onPress={() => setShowSessionModal(true)}
          disabled={startingChat}
        >
          {startingChat ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.chatButtonText}>Start Coaching Session</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSessionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Session Type</Text>
            <Text style={styles.modalSubtitle}>
              How would you like to connect with {coach?.name}?
            </Text>

            <TouchableOpacity
              style={styles.sessionOption}
              onPress={() => handleStartChat('text')}
            >
              <View style={styles.sessionIconContainer}>
                <MessageCircle size={24} color="#000" />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>Text Chat</Text>
                <Text style={styles.sessionDescription}>
                  Have a conversation through text messages
                </Text>
              </View>
            </TouchableOpacity>

            {coach?.tavus_replica_id && (
              <TouchableOpacity
                style={styles.sessionOption}
                onPress={() => handleStartChat('video')}
              >
                <View style={styles.sessionIconContainer}>
                  <Video size={24} color="#000" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>Video Session</Text>
                  <Text style={styles.sessionDescription}>
                    Connect face-to-face with live video
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSessionModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRecap}
        transparent
        animationType="fade"
        onRequestClose={handleRecapDismiss}
      >
        <View style={styles.recapModalOverlay}>
          <View style={styles.recapModalContent}>
            {pendingSession?.previousSessionId && (
              <SessionRecap
                previousSessionId={pendingSession.previousSessionId}
                onDismiss={handleRecapDismiss}
                onAccept={handleRecapAccept}
              />
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  availableSessionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sessionBadgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  traitTag: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  traitText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  chatButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatButtonDisabled: {
    opacity: 0.6,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  sessionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalCancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  recapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapModalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
});
