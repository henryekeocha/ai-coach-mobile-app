import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Coach } from '@/types/database';
import { createTavusClient, TavusPersona } from '@/services/tavus';
import { X, Video, ChevronRight, Trash2 } from 'lucide-react-native';
import { getImageSource } from '@/lib/images';

export default function CreateCoachScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tavusPersonas, setTavusPersonas] = useState<TavusPersona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [privateCoaches, setPrivateCoaches] = useState<Coach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
    if (apiKey) {
      loadTavusPersonas();
    }
    loadPrivateCoaches();
  }, []);

  const loadPrivateCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('creator_id', user?.id)
        .eq('is_public', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrivateCoaches(data || []);
    } catch (error) {
      console.error('Error loading private coaches:', error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const loadTavusPersonas = async () => {
    const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
    if (!apiKey) return;

    setLoadingPersonas(true);
    try {
      const tavus = createTavusClient(apiKey);
      const personas = await tavus.listPersonas();
      setTavusPersonas(personas);
    } catch (error) {
      console.error('Error loading Tavus personas:', error);
    } finally {
      setLoadingPersonas(false);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const addTrait = () => {
    if (traitInput.trim() && !traits.includes(traitInput.trim())) {
      setTraits([...traits, traitInput.trim()]);
      setTraitInput('');
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter((t) => t !== trait));
  };

  const handleDelete = async (coachId: string, coachName: string) => {
    Alert.alert(
      'Delete Coach',
      `Are you sure you want to delete "${coachName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('coaches')
                .delete()
                .eq('id', coachId);

              if (error) throw error;

              loadPrivateCoaches();
              Alert.alert('Success', 'Coach deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleCreate = async () => {
    if (!name || !title || !description || !systemPrompt) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (specialties.length === 0) {
      Alert.alert('Missing Specialties', 'Please add at least one specialty');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          creator_id: user?.id,
          name,
          title,
          description,
          specialties,
          personality_traits: traits,
          system_prompt: systemPrompt,
          is_public: isPublic,
          avatar_url: avatarUrl || null,
          tavus_persona_id: selectedPersona,
          tavus_replica_id: selectedPersona,
        })
        .select()
        .single();

      if (error) throw error;

      setName('');
      setTitle('');
      setDescription('');
      setSystemPrompt('');
      setSpecialties([]);
      setTraits([]);
      setAvatarUrl('');
      setSelectedPersona(null);

      loadPrivateCoaches();

      Alert.alert('Success', 'Coach created successfully!', [
        {
          text: 'View Coach',
          onPress: () => router.push(`/coach/${data.id}`),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Coach</Text>
        <Text style={styles.subtitle}>Design your personalized AI coach</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {privateCoaches.length > 0 && (
          <View style={styles.privateCoachesSection}>
            <Text style={styles.sectionTitle}>Your Private Coaches</Text>
            <Text style={styles.sectionSubtitle}>
              Coaches only you can see and use
            </Text>
            {privateCoaches.map((coach) => (
              <View key={coach.id} style={styles.privateCoachCard}>
                <TouchableOpacity
                  style={styles.coachCardTouchable}
                  onPress={() => router.push(`/coach/${coach.id}`)}
                >
                  {getImageSource(coach.avatar_url) ? (
                    <Image source={getImageSource(coach.avatar_url)!} style={styles.coachAvatar} />
                  ) : (
                    <View style={styles.coachAvatar}>
                      <Text style={styles.coachAvatarText}>
                        {coach.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.coachCardInfo}>
                    <Text style={styles.coachCardName}>{coach.name}</Text>
                    <Text style={styles.coachCardTitle}>{coach.title}</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(coach.id, coach.name)}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>Create New Coach</Text>
          <View style={styles.field}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Sarah Chen"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Productivity & Systems Coach"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the coach's approach, expertise, and how they can help..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Avatar Image URL</Text>
            <Text style={styles.fieldHint}>
              Link to a profile image (e.g., from Pexels or your own hosting)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              autoCapitalize="none"
              editable={!loading}
            />
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
            ) : null}
          </View>

          {process.env.EXPO_PUBLIC_TAVUS_API_KEY && (
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Video size={18} color="#000" />
                <Text style={styles.label}>Video Persona (Tavus)</Text>
              </View>
              <Text style={styles.fieldHint}>
                Select a Tavus persona to enable video coaching sessions. Without a persona, only text chat will be available.
              </Text>
              {loadingPersonas ? (
                <ActivityIndicator size="small" color="#000" style={{ marginVertical: 16 }} />
              ) : tavusPersonas.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personasScroll}>
                  <TouchableOpacity
                    style={[
                      styles.personaCard,
                      selectedPersona === null && styles.personaCardSelected,
                    ]}
                    onPress={() => setSelectedPersona(null)}
                  >
                    <View style={styles.personaAvatar}>
                      <Text style={styles.personaAvatarText}>None</Text>
                    </View>
                    <Text style={styles.personaName}>No Video</Text>
                  </TouchableOpacity>
                  {tavusPersonas.map((persona) => (
                    <TouchableOpacity
                      key={persona.persona_id}
                      style={[
                        styles.personaCard,
                        selectedPersona === persona.persona_id && styles.personaCardSelected,
                      ]}
                      onPress={() => setSelectedPersona(persona.persona_id)}
                    >
                      {persona.persona_thumbnail_url ? (
                        <Image
                          source={{ uri: persona.persona_thumbnail_url }}
                          style={styles.personaThumbnail}
                        />
                      ) : (
                        <View style={styles.personaAvatar}>
                          <Video size={24} color="#fff" />
                        </View>
                      )}
                      <Text style={styles.personaName} numberOfLines={1}>
                        {persona.persona_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noPersonasText}>
                  No Tavus personas found. Create one in your Tavus dashboard first.
                </Text>
              )}
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>
              Specialties <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a specialty..."
                value={specialtyInput}
                onChangeText={setSpecialtyInput}
                onSubmitEditing={addSpecialty}
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={addSpecialty}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tags}>
              {specialties.map((specialty) => (
                <View key={specialty} style={styles.tag}>
                  <Text style={styles.tagText}>{specialty}</Text>
                  <TouchableOpacity onPress={() => removeSpecialty(specialty)}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Personality Traits</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a trait..."
                value={traitInput}
                onChangeText={setTraitInput}
                onSubmitEditing={addTrait}
                editable={!loading}
              />
              <TouchableOpacity style={styles.addButton} onPress={addTrait}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tags}>
              {traits.map((trait) => (
                <View key={trait} style={styles.tag}>
                  <Text style={styles.tagText}>{trait}</Text>
                  <TouchableOpacity onPress={() => removeTrait(trait)}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              System Prompt <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldHint}>
              Instructions for how the AI should behave as this coach
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="You are a supportive coach who helps people..."
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              multiline
              numberOfLines={6}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsPublic(!isPublic)}
              disabled={loading}
            >
              <View style={[styles.checkbox, isPublic && styles.checkboxChecked]}>
                {isPublic && <View style={styles.checkboxInner} />}
              </View>
              <View style={styles.checkboxLabel}>
                <Text style={styles.label}>Make this coach public</Text>
                <Text style={styles.fieldHint}>
                  Others can discover and use this coach
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Coach</Text>
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  form: {
    gap: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  required: {
    color: '#ef4444',
  },
  fieldHint: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  checkboxLabel: {
    flex: 1,
    gap: 4,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  createButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 12,
    alignSelf: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personasScroll: {
    marginTop: 12,
  },
  personaCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f5f5f5',
  },
  personaCardSelected: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  personaAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personaAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  personaThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  personaName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    maxWidth: 80,
    textAlign: 'center',
  },
  noPersonasText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
  },
  privateCoachesSection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  privateCoachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  coachCardTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e5e5',
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  coachCardInfo: {
    flex: 1,
  },
  coachCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  coachCardTitle: {
    fontSize: 14,
    color: '#666',
  },
});
