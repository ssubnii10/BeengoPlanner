import { Stack } from 'expo-router';
import useAppStore from '../../src/store/useAppStore';

export default function SettingsLayout() {
  const palette = useAppStore(s => s.palette);
  return (
    <Stack
      screenOptions={{
        headerShown:       false,
        contentStyle:      { backgroundColor: 'transparent' },
        animation:         'slide_from_right',
      }}
    />
  );
}