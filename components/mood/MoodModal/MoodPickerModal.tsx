import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOODS } from '../../../constants/moods';
import { MoodType } from '../../../types/moods';

interface MoodPickerModalProps {
  visible: boolean;
  selectedMood: MoodType | null;
  onClose: () => void;
  onSelectMood: (moodType: MoodType) => void;
}

export const MoodPickerModal: React.FC<MoodPickerModalProps> = ({
  visible,
  selectedMood,
  onClose,
  onSelectMood,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragIndicator} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Como você está se sentindo?</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodPickerScroll}
          >
            {MOODS.map(mood => (
              <TouchableOpacity
                key={mood.type}
                style={[
                  styles.moodPickerItem,
                  selectedMood === mood.type && styles.moodPickerItemSelected,
                ]}
                onPress={() => onSelectMood(mood.type)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.moodImageContainer,
                  selectedMood === mood.type && styles.moodImageContainerSelected
                ]}>
                  <Image 
                    source={mood.image} 
                    style={styles.moodPickerImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.moodPickerLabel,
                  selectedMood === mood.type && styles.moodPickerLabelSelected
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#cbd5e1',
    fontWeight: '400',
  },
  moodPickerScroll: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  moodPickerItem: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 24,
    padding: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#000',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodPickerItemSelected: {
    backgroundColor: '#000',
    borderColor: '#3b82f6',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  moodImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodImageContainerSelected: {
    backgroundColor: '#1e3a8a',
  },
  moodPickerImage: {
    width: 48,
    height: 48,
  },
  moodPickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  moodPickerLabelSelected: {
    color: '#93c5fd',
    fontWeight: '700',
  },
});