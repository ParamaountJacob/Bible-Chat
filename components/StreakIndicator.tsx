import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';

interface StreakIndicatorProps {
  count: number;
  newStreak?: boolean;
}

export default function StreakIndicator({ 
  count, 
  newStreak = false 
}: StreakIndicatorProps) {
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Animate when streak increases
  useEffect(() => {
    if (newStreak && count > 1) {
      // Scale up and rotate animation
      scale.value = withSequence(
        withTiming(1.3, { duration: 300 }),
        withDelay(200, withTiming(1, { duration: 300 }))
      );
      
      // Rotate left and right
      rotation.value = withSequence(
        withTiming(-0.1, { duration: 150 }),
        withTiming(0.1, { duration: 150 }),
        withTiming(-0.05, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [count, newStreak]);
  
  // Create animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value * Math.PI}rad` }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Flame size={24} color="#F59E0B" strokeWidth={2.5} />
      </Animated.View>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  iconContainer: {
    marginRight: 4,
  },
  count: {
    fontWeight: '700',
    fontSize: 16,
    color: '#B45309',
  },
});