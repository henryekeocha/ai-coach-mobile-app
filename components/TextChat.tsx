import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Message, Conversation, Coach } from '@/types/database';
import { Send, Crown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SessionRecap from './SessionRecap';

interface TextChatProps {
  conversation: Conversation;
  coach: Coach;
}

const FREE_MESSAGE_LIMIT = 10;

export default function TextChat({ conversation, coach }: TextChatProps) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [previousSessionId, setPreviousSessionId] = useState<string | null>(null);
  const [recapSummary, setRecapSummary] = useState<string | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkForPreviousSession();
    loadMessages();
    subscribeToMessages();
  }, [conversation.id]);

  const checkForPreviousSession = async () => {
    try {
      const { data: prevSession } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('coach_id', conversation.coach_id)
        .eq('status', 'archived')
        .eq('session_type', 'text')
        .order('session_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevSession && conversation.session_number > 1) {
        setPreviousSessionId(prevSession.id);
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id);

        if (count === 0 || count === null) {
          setShowRecap(true);
        }
      }
    } catch (error) {
      console.error('Error checking for previous session:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Count user messages for free tier limit
      const userMessages = data?.filter(msg => msg.sender_type === 'user') || [];
      setUserMessageCount(userMessages.length);

      if (data && data.length === 0 && !showRecap) {
        await sendInitialMessage();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRecapDismiss = async () => {
    setShowRecap(false);
    await sendInitialMessage();
  };

  const handleRecapAccept = async (summary: string) => {
    setShowRecap(false);
    setRecapSummary(summary);

    await supabase
      .from('conversations')
      .update({ session_summary: summary })
      .eq('id', conversation.id);

    await sendInitialMessageWithRecap(summary);
  };

  const sendInitialMessage = async () => {
    const welcomeMessage = `Hello! I'm ${coach.name}, your ${coach.title.toLowerCase()}. ${coach.description} How can I help you today?`;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'coach',
      content: welcomeMessage,
      metadata: {},
    });

    if (error) {
      console.error('Error sending initial message:', error);
    }
  };

  const sendInitialMessageWithRecap = async (summary: string) => {
    const welcomeMessage = `Welcome back! Based on our last session:\n\n${summary}\n\nI'm ready to continue our journey together. What would you like to focus on today?`;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'coach',
      content: welcomeMessage,
      metadata: { recap: true },
    });

    if (error) {
      console.error('Error sending initial message with recap:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    // Check message limit for free users
    if (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT) {
      Alert.alert(
        'Upgrade to Premium',
        `You've reached the free limit of ${FREE_MESSAGE_LIMIT} messages per conversation. Upgrade to Premium for unlimited messaging!`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade Now',
            onPress: () => router.push('/(tabs)/subscription')
          }
        ]
      );
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const { data: userMessageData, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'user',
          content: messageText,
          metadata: {},
        })
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      if (userMessageData) {
        setMessages((prev) => [...prev, userMessageData as Message]);
        setUserMessageCount(prev => prev + 1);
      }

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-coach-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            conversationId: conversation.id,
            userMessage: messageText,
            coachPrompt: coach.system_prompt,
            sessionType: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get coach response');
      }

      const data = await response.json();

      const { data: coachMessageData, error: coachMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'coach',
          content: data.response,
          metadata: {},
        })
        .select()
        .single();

      if (coachMessageError) throw coachMessageError;

      if (coachMessageData) {
        setMessages((prev) => [...prev, coachMessageData as Message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender_type === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.coachMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.coachMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.coachMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {showRecap && previousSessionId && (
        <SessionRecap
          previousSessionId={previousSessionId}
          onDismiss={handleRecapDismiss}
          onAccept={handleRecapAccept}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputWrapper}>
        {!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT * 0.8 && (
          <TouchableOpacity
            style={styles.limitWarning}
            onPress={() => router.push('/(tabs)/subscription')}
          >
            <Crown size={16} color="#fbbf24" />
            <Text style={styles.limitWarningText}>
              {userMessageCount >= FREE_MESSAGE_LIMIT
                ? 'Message limit reached - Upgrade for unlimited'
                : `${FREE_MESSAGE_LIMIT - userMessageCount} free messages left`}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  coachMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#000',
    borderBottomRightRadius: 4,
  },
  coachMessageBubble: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  coachMessageText: {
    color: '#000',
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  limitWarningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
