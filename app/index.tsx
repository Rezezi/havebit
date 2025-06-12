import { Redirect } from 'expo-router';

export default function IndexPage() {
  // Redirect to the tabs layout or auth depending on authentication state
  return <Redirect href="/(tabs)" />;
}