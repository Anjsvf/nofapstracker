import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { emojiCategories } from '../../constants/emojis';

const { width, height } = Dimensions.get('window');
const EMOJI_SIZE = width > 400 ? 32 : 28;
const COLUMNS = width > 400 ? 8 : 7;
const BUTTON_SIZE = (width - 60) / COLUMNS;

interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

type Category = keyof typeof emojiCategories;


const categoryIcons: Record<Category, string> = {
  'Frequentes': '⭐',
  'Carinhas': '😀',
  'Gestos': '👋',
  'Corações': '❤️',
  'Animais': '🐶',
  'Comidas': '🍎',
  'Bandeiras': '🏳️',
};

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Carinhas');

  const categories = useMemo(() => 
    Object.keys(emojiCategories) as Category[],
    []
  );

  const currentEmojis = useMemo(() => 
    emojiCategories[selectedCategory] || [],
    [selectedCategory]
  );

  const renderEmoji = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.emojiButton}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.emojiText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategoryTab = (category: Category) => {
    const isActive = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        onPress={() => setSelectedCategory(category)}
        style={[
          styles.categoryTab,
          isActive && styles.activeCategoryTab,
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryIcon}>
          {categoryIcons[category]}
        </Text>
        <Text
          style={[
            styles.categoryText,
            isActive && styles.activeCategoryText,
          ]}
          numberOfLines={1}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
       
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
            colors={['#0f172a', '#0f172a', '#0f172a']}
            style={styles.emojiPickerContainer}
          >
            
            <View style={styles.header}>
              <View style={styles.headerIndicator} />
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Escolher Emoji</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            
            <View style={styles.categoriesSection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {categories.map(renderCategoryTab)}
              </ScrollView>
            </View>

            
            <View style={styles.emojiSection}>
              <FlatList
                data={currentEmojis}
                keyExtractor={(item, index) => `${selectedCategory}-${item}-${index}`}
                renderItem={renderEmoji}
                numColumns={COLUMNS}
                contentContainerStyle={styles.emojiGrid}
                showsVerticalScrollIndicator={false}
                bounces={false}
                getItemLayout={(data, index) => ({
                  length: BUTTON_SIZE,
                  offset: BUTTON_SIZE * Math.floor(index / COLUMNS),
                  index,
                })}
              />
            </View>

           
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {currentEmojis.length} emojis disponíveis
              </Text>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  safeArea: {
    maxHeight: height * 0.75,
  },
  emojiPickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    minHeight: height * 0.5,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Categories
  categoriesSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabs: {
    paddingLeft: 20,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  activeCategoryTab: {
    backgroundColor: '#0f172a',
    borderColor: '#1f3464ff',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    flex: 1,
  },
  activeCategoryText: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  
  // Emojis
  emojiSection: {
    flex: 1,
    paddingTop: 16,
  },
  emojiGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emojiButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  emojiText: {
    fontSize: EMOJI_SIZE,
    lineHeight: EMOJI_SIZE + 4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    textAlign: 'center',
    opacity: 0.8,
  },
});