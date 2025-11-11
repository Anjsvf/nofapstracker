import { Check, Smile } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOODS, TRIGGERS } from '../../constants/moods';
import { moodRepository } from '../../data/MoodRepository';
import { MoodType } from '../../types/moods';
import { MoodPickerModal } from './MoodModal/MoodPickerModal';

interface MoodEntryFormProps {
  onSuccess: () => void;
}

export const MoodEntryForm: React.FC<MoodEntryFormProps> = ({ onSuccess }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState('');
  const [notesHeight, setNotesHeight] = useState(60);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTriggers, setCustomTriggers] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const moodScale = useRef(new Animated.Value(0)).current;

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const addCustomTrigger = () => {
    if (customInput.trim()) {
      setCustomTriggers(prev => [...prev, customInput.trim()]);
      setCustomInput('');
    }
  };

  const removeCustomTrigger = (index: number) => {
    setCustomTriggers(prev => prev.filter((_, i) => i !== index));
  };

  const selectMood = (moodType: MoodType) => {
    setSelectedMood(moodType);
    setShowMoodPicker(false);
    
    Animated.spring(moodScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getSelectedMoodData = () => {
    return MOODS.find(m => m.type === selectedMood);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Atenção', 'Por favor, selecione como você está se sentindo.');
      return;
    }

    setIsSubmitting(true);

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const allTriggers = [...selectedTriggers, ...customTriggers];
      await moodRepository.addMoodEntry(selectedMood, notes, allTriggers);
      Alert.alert('Sucesso', 'Registro salvo com sucesso! 📝');
      
      setSelectedMood(null);
      setNotes('');
      setSelectedTriggers([]);
      setCustomTriggers([]);
      setCustomInput('');
      setShowCustomInput(false);
      setNotesHeight(60);
      moodScale.setValue(0);
      
      onSuccess();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
      console.error('Error saving mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.section}>
          <View style={styles.titleContainer}>
            <View style={styles.titleAccent} />
            <Text style={styles.sectionTitle}>Como você está se sentindo?</Text>
          </View>
          
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMoodPicker(true)}
            activeOpacity={0.7}
          >
            {selectedMood ? (
              <Animated.View 
                style={[
                  styles.selectedMoodContainer,
                  { transform: [{ scale: moodScale }] }
                ]}
              >
                <View style={styles.moodImageWrapper}>
                  <Image 
                    source={getSelectedMoodData()?.image} 
                    style={styles.selectedMoodImage}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.selectedMoodText}>
                    {getSelectedMoodData()?.label}
                  </Text>
                  <Text style={styles.selectedMoodSubtext}>
                    Toque para alterar
                  </Text>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIcon}>
                  <Smile size={24} color="#64748b" strokeWidth={2} />
                </View>
                <Text style={styles.pickerPlaceholder}>
                  Toque para selecionar seu humor
                </Text>
              </View>
            )}
            <View style={styles.pickerArrow}>
              <Text style={styles.pickerIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.titleContainer}>
            <View style={styles.titleAccent} />
            <Text style={styles.sectionTitle}>Notas (opcional)</Text>
          </View>
          <View style={styles.notesWrapper}>
            <TextInput
              style={[styles.notesInput, { height: notesHeight }]}
              placeholder="Escreva sobre seu dia..."
              placeholderTextColor="#64748b"
              multiline
              value={notes}
              onChangeText={setNotes}
              onContentSizeChange={(event) => {
                setNotesHeight(
                  Math.max(60, Math.min(140, event.nativeEvent.contentSize.height))
                );
              }}
            />
            <View style={styles.notesCounter}>
              <Text style={styles.notesCounterText}>{notes.length} caracteres</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleContainer}>
            <View style={styles.titleAccent} />
            <Text style={styles.sectionTitle}>O que influenciou? (opcional)</Text>
          </View>
          <View style={styles.triggersGrid}>
            {TRIGGERS.map(trigger => (
              <TouchableOpacity
                key={trigger.type}
                style={[
                  styles.triggerButton,
                  selectedTriggers.includes(trigger.type) && styles.triggerButtonSelected,
                ]}
                onPress={() => toggleTrigger(trigger.type)}
                activeOpacity={0.7}
              >
                <View style={styles.triggerContent}>
                  <Image 
                    source={trigger.image} 
                    style={styles.triggerImage}
                    resizeMode="contain"
                  />
                  <Text style={[
                    styles.triggerLabel,
                    selectedTriggers.includes(trigger.type) && styles.triggerLabelSelected
                  ]}>
                    {trigger.label}
                  </Text>
                </View>
                {selectedTriggers.includes(trigger.type) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.triggerButton,
                showCustomInput && styles.triggerButtonSelected,
              ]}
              onPress={() => {
                setShowCustomInput(prev => !prev);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.triggerContent}>
                <Text style={styles.triggerIconText}>✏️</Text>
                <Text style={[
                  styles.triggerLabel,
                  showCustomInput && styles.triggerLabelSelected
                ]}>
                  Personalizado
                </Text>
              </View>
              {showCustomInput && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View style={styles.customSection}>
              <TextInput
                style={styles.customInput}
                placeholder="Digite o que mais influenciou seu humor hoje..."
                placeholderTextColor="#64748b"
                value={customInput}
                onChangeText={setCustomInput}
                onSubmitEditing={addCustomTrigger}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={addCustomTrigger}
                activeOpacity={0.8}
              >
                <Text style={styles.addCustomButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          {customTriggers.length > 0 && (
            <View style={styles.customTags}>
              {customTriggers.map((trig, idx) => (
                <View key={idx} style={styles.customTag}>
                  <Text style={styles.customTagText}>{trig}</Text>
                  <TouchableOpacity 
                    onPress={() => removeCustomTrigger(idx)}
                    style={styles.removeTagButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {selectedMood && (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <View style={styles.submitButtonContent}>
                {isSubmitting ? (
                  <>
                    <Text style={styles.submitButtonText}>Salvando...</Text>
                    <View style={styles.loadingDots}>
                      <View style={[styles.dot, styles.dot1]} />
                      <View style={[styles.dot, styles.dot2]} />
                      <View style={[styles.dot, styles.dot3]} />
                    </View>
                  </>
                ) : (
                  <>
                    <Check size={20} color="#ffffff" strokeWidth={3} />
                    <Text style={styles.submitButtonText}>Salvar Registro</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <MoodPickerModal
        visible={showMoodPicker}
        selectedMood={selectedMood}
        onClose={() => setShowMoodPicker(false)}
        onSelectMood={selectMood}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  titleAccent: {
    width: 5,
    height: 24,
    backgroundColor: '#000000ff',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pickerButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: '#01050a41',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  pickerPlaceholder: {
    color: '#ffffffff',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.3,
  },
  pickerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a121f39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  moodImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  selectedMoodImage: {
    width: 36,
    height: 36,
  },
  selectedMoodText: {
    fontSize: 19,
    color: '#f1f5f9',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  selectedMoodSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '500',
  },
  notesWrapper: {
    position: 'relative',
  },
  notesInput: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    color: '#f1f5f9',
    fontSize: 17,
    textAlignVertical: 'top',
    borderWidth: 3,
    borderColor: '#334155',
    lineHeight: 26,
    fontWeight: '500',
  },
  notesCounter: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  notesCounterText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 3,
    borderColor: '#03070eff',
    minWidth: 110,
    minHeight: 48,
  },
  triggerButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#00c607ff',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  triggerImage: {
    width: 20,
    height: 20,
  },
  triggerIconText: {
    fontSize: 20,
    color: '#f1f5f9',
  },
  triggerLabel: {
    fontSize: 15,
    color: '#f1f5f9',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  triggerLabelSelected: {
    fontWeight: '700',
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#07e987ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  customSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 3,
    borderColor: '#334155',
    fontWeight: '500',
  },
  addCustomButton: {
    backgroundColor: '#ff0008ff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    height: 56,
    shadowColor: '#ff0008ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  addCustomButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  customTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 3,
    borderColor: '#334155',
  },
  customTagText: {
    fontSize: 15,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  removeTagButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTagText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#08ff90e5',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#538611ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#00c617ff',
    minHeight: 64,
  },
  submitButtonDisabled: {
    backgroundColor: '#08ff90bb',
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});