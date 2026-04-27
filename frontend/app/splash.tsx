/**
 * app/splash.tsx — Route Splash Screen (Option B)
 * Wrapper Expo Router → SplashScreen.
 * Quand l'animation se termine, on navigue vers /radar.
 */

import { router } from 'expo-router';
import SplashScreen from '../src/screens/SplashScreen';

export default function SplashRoute() {
  return (
    <SplashScreen
      onFinish={() => router.replace('/radar')}
    />
  );
}
