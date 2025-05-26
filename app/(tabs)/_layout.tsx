import { Outlet } from 'expo-router';
import { View } from 'react-native';
import Navigation from '@/components/Navigation';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Navigation />
      <Outlet />
    </View>
  );
}