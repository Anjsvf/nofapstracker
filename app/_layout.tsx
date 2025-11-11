import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import {
  RobotoMono_400Regular,
  RobotoMono_700Bold
} from '@expo-google-fonts/roboto-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
 
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'RobotoMono-Regular': RobotoMono_400Regular,
    'RobotoMono-Bold': RobotoMono_700Bold,
  });

  
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="+not-found" /> */}
      </Stack>
      <StatusBar style="light"  />
    </>
  );
}