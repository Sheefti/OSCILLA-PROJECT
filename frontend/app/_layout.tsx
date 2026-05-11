import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

LogBox.ignoreLogs(['THREE.Clock: This module has been deprecated', 'THREE.Color: Alpha component']);

export default function RootLayout() {
  const [orientationReady, setOrientationReady] = useState(false);

  useEffect(() => {
    // Verrouille l'orientation en Landscape AVANT tout rendu d'écran applicatif.
    // On bloque l'arbre React jusqu'à la résolution de la promesse pour éviter
    // qu'un écran se rende en portrait si le device démarre en mode portrait.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      .catch((e) => {
        // Sur simulateur ou si le lock n'est pas supporté, on continue quand même
        console.warn('[Layout] lockAsync failed:', e);
      })
      .finally(() => {
        setOrientationReady(true);
      });
  }, []);

  // Ne rien rendre tant que l'orientation n'est pas verrouillée
  if (!orientationReady) return null;

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
