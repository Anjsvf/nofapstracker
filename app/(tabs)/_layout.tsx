 import { Tabs, usePathname } from 'expo-router';
import { MessageCircle, RotateCcw, Smile, Timer, Trophy, User } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname(); 

  const isChat = pathname === '/chat'; 

  const tabBarHeight = Platform.OS === 'ios' ? 80 + insets.bottom : 70 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
         
          {
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            display: isChat ? 'none' : 'flex', 
          },
        ],
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#64748b',
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { paddingBottom: insets.bottom }]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contador',
          tabBarIcon: ({ size, color }) => <Timer size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: 'Badges',
          tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Humor',
          tabBarIcon: ({ size, color }) => <Smile size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
        }}
      />
       <Tabs.Screen
        name="reset"
        options={{
          title: 'resets',
          tabBarIcon: ({ size, color }) => <RotateCcw size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

