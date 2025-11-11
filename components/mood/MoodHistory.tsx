import { ChevronDown, ChevronUp, Inbox, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { getMoodByType, getTriggerByType, MOODS } from '../../constants/moods';
import { moodRepository } from '../../data/MoodRepository';
import { MoodEntry, MoodType } from '../../types/moods';
import { formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import { DeleteConfirmationModal } from '../mood/DeleteConfirmationModal/DeleteConfirmationModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MoodHistoryProps {
  refreshTrigger: number;
}

export const MoodHistory: React.FC<MoodHistoryProps> = ({ refreshTrigger }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filterMood, setFilterMood] = useState<MoodType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = filterMood ? { moods: [filterMood] } : undefined;
      const data = await moodRepository.getMoodEntries(filter);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Erro', 'Não foi possível carregar os registros.');
    } finally {
      setIsLoading(false);
    }
  }, [filterMood]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, refreshTrigger]);

  const handleDeletePress = useCallback((id: number) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (entryToDelete === null) return;

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await moodRepository.deleteMoodEntry(entryToDelete);
      await loadEntries();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o registro.');
    } finally {
      setEntryToDelete(null);
    }
  }, [entryToDelete, loadEntries]);

  const toggleNoteExpansion = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleFilterPress = useCallback((mood: MoodType | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterMood(mood);
  }, []);

  const stats = useMemo(() => {
    const total = entries.length;
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);
    
    return { total, moodCounts };
  }, [entries]);

  const FilterButton = ({ mood, label, image }: { mood: MoodType | null; label: string; image?: any }) => {
    const isActive = filterMood === mood;
    const color = mood ? getMoodByType(mood)?.color : '#3b82f6';
    const count = mood ? stats.moodCounts[mood] || 0 : stats.total;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
          { borderColor: isActive ? color : '#334155' },
        ]}
        onPress={() => handleFilterPress(mood)}
        activeOpacity={0.7}
      >
        {image && (
          <Image 
            source={image} 
            style={styles.filterImage}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.countBadge, isActive && { backgroundColor: color }]}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EntryCard = ({ entry }: { entry: MoodEntry }) => {
    const mood = getMoodByType(entry.mood);
    const isExpanded = expandedNotes.has(entry.id);
    const hasLongNote = entry.notes && entry.notes.length > 150;

    return (
      <View style={[styles.entryCard, { borderLeftColor: mood?.color }]}>
        <View style={styles.entryHeader}>
          <View style={styles.entryMood}>
            <View style={[styles.moodImageContainer, { backgroundColor: `${mood?.color}20` }]}>
              <Image 
                source={mood?.image} 
                style={styles.entryMoodImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.entryMoodLabel}>{mood?.label}</Text>
              <View style={styles.entryDate}>
                <Text style={styles.entryDateText}>{formatDisplayDate(entry.date)}</Text>
                <Text style={styles.entryTimeText}> • {formatDisplayTime(entry.createdAt)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButtonCompact}
            onPress={() => handleDeletePress(entry.id)}
            activeOpacity={0.7}
          >
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
        </View>

        {entry.notes && (
          <View style={styles.notesContainer}>
            <View style={styles.notesQuote} />
            <View style={styles.notesContent}>
              <Text 
                style={styles.entryNotes} 
                numberOfLines={isExpanded ? undefined : 3}
              >
                {entry.notes}
              </Text>
              {hasLongNote && (
                <TouchableOpacity 
                  onPress={() => toggleNoteExpansion(entry.id)}
                  style={styles.expandButton}
                  activeOpacity={0.7}
                >
                  {isExpanded ? (
                    <ChevronUp color="#3b82f6" size={16} />
                  ) : (
                    <ChevronDown color="#3b82f6" size={16} />
                  )}
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Ver menos' : 'Ver mais'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {entry.triggers && entry.triggers.length > 0 && (
          <View style={styles.entryTriggers}>
            <Text style={styles.triggersLabel}>Gatilhos:</Text>
            <View style={styles.triggersRow}>
              {entry.triggers.map(trigger => {
                const triggerData = getTriggerByType(trigger);
                return (
                  <View key={trigger} style={styles.triggerTag}>
                    {triggerData?.image && (
                      <Image 
                        source={triggerData.image} 
                        style={styles.triggerTagImage}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.triggerTagText}>
                      {triggerData?.label || trigger}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filtrar por humor</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterButton mood={null} label="Todos" />
          {MOODS.map(mood => (
            <FilterButton 
              key={mood.type}
              mood={mood.type}
              label={mood.label}
              image={mood.image}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.entriesList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.entriesListContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Carregando registros...</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Inbox color="#475569" size={64} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {filterMood ? 'Nenhum registro encontrado' : 'Nenhum registro ainda'}
            </Text>
            <Text style={styles.emptyText}>
              {filterMood
                ? 'Tente selecionar outro humor no filtro acima.'
                : 'Comece adicionando seu primeiro registro de humor!'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {entries.length} {entries.length === 1 ? 'registro' : 'registros'}
              </Text>
            </View>
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </>
        )}
      </ScrollView>

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setEntryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  filterTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterScrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#334155',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#1e293b',
    transform: [{ scale: 1.02 }],
  },
  filterImage: {
    width: 18,
    height: 18,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#f1f5f9',
  },
  countBadge: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    color: '#f1f5f9',
    fontWeight: '700',
  },
  entriesList: {
    flex: 1,
    backgroundColor: '#000',
  },
  entriesListContent: {
    padding: 16,
    paddingBottom: 120,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
  entryCard: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moodImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryMoodImage: {
    width: 28,
    height: 28,
  },
  entryMoodLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  entryTimeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  deleteButtonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef444410',
    borderWidth: 1,
    borderColor: '#ef444430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 12,
  },
  notesQuote: {
    width: 3,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginRight: 12,
  },
  notesContent: {
    flex: 1,
  },
  entryNotes: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 4,
    backgroundColor: '#3b82f610',
    borderRadius: 8,
  },
  expandButtonText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  entryTriggers: {
    marginTop: 4,
  },
  triggersLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  triggersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  triggerTagImage: {
    width: 14,
    height: 14,
  },
  triggerTagText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
});