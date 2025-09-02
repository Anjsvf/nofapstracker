import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;

interface ReactionDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  allReactions: [string, string[]][];
}

const ReactionDetailsModal: React.FC<ReactionDetailsModalProps> = ({
  visible,
  onClose,
  allReactions,
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
       
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2;
      },
      onPanResponderGrant: () => {
      
        translateY.stopAnimation();
        isScrolling.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        
        if (gestureState.dy >= 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
      
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          
          Animated.spring(translateY, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => {
        
        return isScrolling.current;
      },
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

 
  const handleOverlayPress = () => {
    onClose();
  };


  const handleScrollBegin = () => {
    isScrolling.current = true;
  };

  const handleScrollEnd = () => {
    isScrolling.current = false;
  };

  
  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
       
        <View style={styles.overlayTouchArea} onTouchEnd={handleOverlayPress} />
        
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <Text style={styles.modalTitle}>Reações Adicionais</Text>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.reactionsContainer} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            onScrollBeginDrag={handleScrollBegin}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollBegin={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
           
            scrollEventThrottle={16}
          >
            {allReactions.map(([emoji, users]) => (
              <View key={emoji} style={styles.reactionSection}>
              
                <View style={styles.emojiSection}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>({users.length})</Text>
                </View>
                
               
                <View style={styles.usersSection}>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <View key={`${user}-${index}`} style={styles.userItem}>
                      
                        <Text style={styles.userName}>{user}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.userItem}>
                      <Text style={styles.userEmoji}>❌</Text>
                      <Text style={styles.noUsersText}>Nenhum usuário</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#171a18ff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  reactionsContainer: {
    flex: 1,
  },
  reactionSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#110202ff',
  },
  emojiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  reactionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  reactionCount: {
    fontSize: 14,
    color: '#ffffffff',
    fontFamily: 'Inter-Medium',
  },
  usersSection: {
    paddingLeft: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#00000014',
    borderRadius: 12,
    marginRight: 8,
  },
  userEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    color: '#ffffffff',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  noUsersText: {
    fontSize: 14,
    color: '#ffffffff',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    flex: 1,
  },
});

export default ReactionDetailsModal;