/**
 * app/_layout.tsx — Root Layout
 * Point d'entrée Expo Router.
 * 
 * Volontairement minimaliste pour éviter les conflits Fabric (New Architecture).
 * Le verrouillage d'orientation et SafeAreaProvider sont ici — rien d'autre.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function RootLayout() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          animationMatchesGesture: false,
          autoHideHomeIndicator: false,
          statusBarHidden: false,
          navigationBarHidden: false,
        }}
      />
    </SafeAreaProvider>
  );
}
