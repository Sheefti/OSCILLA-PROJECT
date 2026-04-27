/**
 * app/index.tsx — Point d'entrée de l'application
 * Redirige systématiquement vers la Splash Screen.
 * La Splash navigue ensuite vers /radar une fois terminée.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}
