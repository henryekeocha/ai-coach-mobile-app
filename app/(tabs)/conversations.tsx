import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Coach } from '@/types/database';
import { MessageCircle, Plus, X, Video } from 'lucide-react-native';
import SessionRecap from '@/components/SessionRecap';

interface CoachWithSessions {
  coach: Coach;
  sessions: Conversation[];
  activeSession?: Conversation;
}

interface PendingSession {
  coachId: string;
  sessionType: 'text' | 'video';
  previousSessionId?: string;
  sessionNumber: number;
}

export default function ConversationsScreen() {
  const { user } = useAuth();
  const [coachSessions, setCoachSessions] = useState<CoachWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCoaches, setExpandedCoaches] = useState<Set<string>>(new Set());
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [showRecap, setShowRecap] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, coach:coaches(*)')
        .eq('user_id', user?.id)
        .eq('session_type', 'text')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, conv) => {
        const coachId = conv.coach_id;
        if (!acc[coachId]) {
          acc[coachId] = {
            coach: conv.coach!,
            sessions: [],
            activeSession: undefined,
          };
        }
        acc[coachId].sessions.push(conv);
        if (conv.status === 'active') {
          acc[coachId].activeSession = conv;
        }
        return acc;
      }, {} as Record<string, CoachWithSessions>);

      setCoachSessions(Object.values(grouped));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoachExpansion = (coachId: string) => {
    setExpandedCoaches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(coachId)) {
        newSet.delete(coachId);
      } else {
        newSet.add(coachId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const startNewSession = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowSessionModal(true);
  };

  const handleStartChat = async (sessionType: 'text' | 'video') => {
    if (!selectedCoach) return;

    setShowSessionModal(false);

    try {
      const { data: existingActive } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('coach_id', selectedCoach.id)
        .eq('status', 'active')
        .eq('session_type', sessionType)
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
        .eq('user_id', user?.id)
        .eq('coach_id', selectedCoach.id)
        .eq('session_type', sessionType)
        .order('session_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSessionNumber = prevSession ? prevSession.session_number + 1 : 1;

      setPendingSession({
        coachId: selectedCoach.id,
        sessionType,
        previousSessionId: prevSession?.id,
        sessionNumber: nextSessionNumber,
      });

      if (prevSession && nextSessionNumber > 1) {
        setShowRecap(true);
      } else {
        createNewSession(selectedCoach.id, sessionType, nextSessionNumber);
      }
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };

  const createNewSession = async (
    coachId: string,
    sessionType: 'text' | 'video',
    sessionNumber: number,
    sessionSummary?: string
  ) => {
    try {
      const { data: newConv, error } = await supabase
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

      loadConversations();
      router.push(`/chat/${newConv.id}`);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleRecapDismiss = () => {
    setShowRecap(false);
    if (pendingSession) {
      createNewSession(pendingSession.coachId, pendingSession.sessionType, pendingSession.sessionNumber);
    }
    setPendingSession(null);
  };

  const handleRecapAccept = (summary: string) => {
    setShowRecap(false);
    if (pendingSession) {
      createNewSession(pendingSession.coachId, pendingSession.sessionType, pendingSession.sessionNumber, summary);
    }
    setPendingSession(null);
  };

  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', sessionId);

      if (error) throw error;

      loadConversations();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const renderCoachSessions = ({ item }: { item: CoachWithSessions }) => {
    const isExpanded = expandedCoaches.has(item.coach.id);
    const activeSessions = item.sessions.filter((s) => s.status === 'active');
    const archivedSessions = item.sessions.filter((s) => s.status === 'archived');

    return (
      <View style={styles.coachSection}>
        <TouchableOpacity
          style={styles.coachHeader}
          onPress={() => toggleCoachExpansion(item.coach.id)}
        >
          {item.coach.avatar_url ? (
            <Image source={{ uri: item.coach.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.coach.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>{item.coach.name}</Text>
            <Text style={styles.sessionCount}>
              {item.sessions.length} {item.sessions.length === 1 ? 'session' : 'sessions'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={() => startNewSession(item.coach)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sessionsContainer}>
            {activeSessions.map((session) => (
              <View key={session.id} style={[styles.sessionCard, styles.activeSession]}>
                <TouchableOpacity
                  style={styles.sessionTouchable}
                  onPress={() => router.push(`/chat/${session.id}`)}
                >
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    </View>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.last_message_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.endSessionButton}
                  onPress={() => endSession(session.id)}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.endSessionText}>End</Text>
                </TouchableOpacity>
              </View>
            ))}

            {archivedSessions.length > 0 && (
              <>
                <Text style={styles.archivedLabel}>Previous Sessions</Text>
                {archivedSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.sessionCard}
                    onPress={() => router.push(`/chat/${session.id}`)}
                  >
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.last_message_at)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.title}>Your Chats</Text>
        <Text style={styles.subtitle}>Continue your coaching conversations</Text>
      </View>

      <FlatList
        data={coachSessions}
        renderItem={renderCoachSessions}
        keyExtractor={(item) => item.coach.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start a chat with a coach from the Discover tab
            </Text>
          </View>
        }
      />

      <Modal
        visible={showSessionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sessionModalContent}>
            <Text style={styles.modalTitle}>Choose Session Type</Text>
            <Text style={styles.modalSubtitle}>
              How would you like to connect with {selectedCoach?.name}?
            </Text>

            <TouchableOpacity
              style={styles.sessionOption}
              onPress={() => handleStartChat('text')}
            >
              <View style={styles.sessionIconContainer}>
                <MessageCircle size={24} color="#000" />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionOptionTitle}>Text Chat</Text>
                <Text style={styles.sessionDescription}>
                  Have a conversation through text messages
                </Text>
              </View>
            </TouchableOpacity>

            {selectedCoach?.tavus_replica_id && (
              <TouchableOpacity
                style={styles.sessionOption}
                onPress={() => handleStartChat('video')}
              >
                <View style={styles.sessionIconContainer}>
                  <Video size={24} color="#000" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionOptionTitle}>Video Session</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  coachSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  sessionCount: {
    fontSize: 14,
    color: '#666',
  },
  newSessionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  sessionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
  },
  activeSession: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  sessionTouchable: {
    flex: 1,
    padding: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
  },
  activeBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  archivedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
  endSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  endSessionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  sessionModalContent: {
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
  sessionOptionTitle: {
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
});
