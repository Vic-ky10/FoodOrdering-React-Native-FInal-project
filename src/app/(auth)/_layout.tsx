import { useAuth } from '@/Providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { session, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Redirect href={isAdmin ? "/(admin)" : "/(user)"} />;
  }
  return <Stack />;
}
