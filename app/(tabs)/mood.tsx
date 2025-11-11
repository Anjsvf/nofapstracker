import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodAnalytics } from '../../components/mood/MoodAnalytics';
import { MoodEntryForm } from '../../components/mood/MoodEntryForm';
import { MoodHistory } from '../../components/mood/MoodHistory';
import { moodRepository } from '../../data/MoodRepository';

type TabType = 'entry' | 'history' | 'analytics';

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await moodRepository.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize mood database:', error);
    }
  };

  const handleEntrySuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('history');
  };

  if (!isInitialized) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Iniciando Diário de Humor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diário de Humor</Text>
        <Text style={styles.headerSubtitle}>Acompanhe suas emoções diariamente</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'entry' && styles.tabActive]}
          onPress={() => setActiveTab('entry')}
        >
          <Text style={[styles.tabText, activeTab === 'entry' && styles.tabTextActive]}>
            Registrar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Histórico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
            Análises
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'entry' && <MoodEntryForm onSuccess={handleEntrySuccess} />}
        {activeTab === 'history' && <MoodHistory refreshTrigger={refreshTrigger} />}
        {activeTab === 'analytics' && <MoodAnalytics refreshTrigger={refreshTrigger} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
});