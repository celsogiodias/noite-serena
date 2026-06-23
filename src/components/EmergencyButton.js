import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function EmergencyButton({ onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.button}>
        <Text style={styles.icon}>🌙</Text>
        <Text style={styles.text}>Não estou conseguindo dormir 😔</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.emergency,
    opacity: 0.95,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  icon: {
    fontSize: 22,
    marginRight: theme.spacing.sm,
  },
  text: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
