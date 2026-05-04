import OnboardingScreen from './src/screens/OnboardingScreen';
import { useState, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Dashboard from './src/screens/Dashboard';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!onboardingDone) {
    return <OnboardingScreen onFinish={() => setOnboardingDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      <Dashboard />
    </SafeAreaProvider>
  );
}
