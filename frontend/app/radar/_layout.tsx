/**
 * app/radar/_layout.tsx — Layout de la section Radar
 * Stack local avec animation slide pour la transition
 * Dashboard → AsteroidInspector.
 */

import { Stack } from 'expo-router';

export default function RadarLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#010810' },
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
        animationMatchesGesture: false,
        autoHideHomeIndicator: false,
        statusBarHidden: false,
        navigationBarHidden: false,
      }}
    />
  );
}
