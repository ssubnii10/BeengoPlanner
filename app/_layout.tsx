import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useAppStore from '../src/store/useAppStore';
import { useResponsive } from '../src/hooks/useResponsive';

export default function RootLayout() {
  const loadAll  = useAppStore(s => s.loadAll);
  const palette  = useAppStore(s => s.palette);
  const { bp, contentWidth } = useResponsive();

  useEffect(() => { loadAll(); }, []);

  return (
    <View style={[styles.root, { backgroundColor: bp === 'desktop' ? palette.bg2 : palette.bg }]}>
      <StatusBar style="dark" />
      <View style={[
        styles.frame,
        {
          width: contentWidth,
          backgroundColor: palette.bg,
          ...(bp === 'desktop' && {
            marginVertical:  24,
            borderRadius:    32,
            overflow:        'hidden',
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: 8 },
            shadowOpacity:   0.12,
            shadowRadius:    24,
            elevation:       12,
          }),
        },
      ]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index"  />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { flex: 1, overflow: 'hidden' },
});