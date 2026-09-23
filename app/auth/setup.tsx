import { Redirect } from 'expo-router';

// Compatibility route. Signup data now stays in the in-memory onboarding context.
export default function SetupScreen() {
  return <Redirect href="/auth/about-you" />;
}
