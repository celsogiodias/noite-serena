import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { pickRandomQuote } from '../utils/sleepUtils';

export default function BreathingCircle({ exercise, isActive, onComplete }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [repeat, setRepeat] = useState(0);
  const [completed, setCompleted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const totalDuration = exercise.duration || 60;

  const phases = exercise.phases || [];
  const currentPhase = phases[phaseIndex] || phases[0] || { action: 'Respire', duration: 4, instruction: 'Respire calmamente' };

  useEffect(() => {
    if (!isActive || completed) return;

    const phaseDuration = currentPhase.duration || 4;
    if (phaseIndex === 0 && phaseTime === 0 && repeat === 0) {
      setPhaseTime(phaseDuration);
    }

    const scale = currentPhase.action === 'Inspire' ? 1.5 : currentPhase.action === 'Expire' ? 1 : 1.25;
    Animated.timing(scaleAnim, {
      toValue: scale,
      duration: phaseDuration * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    timerRef.current = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % phases.length;
          if (nextIndex === 0) {
            const nextRepeat = repeat + 1;
            if (nextRepeat >= exercise.repeats) {
              finish();
              return 0;
            }
            setRepeat(nextRepeat);
          }
          setPhaseIndex(nextIndex);
          return phases[nextIndex]?.duration || 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, phaseIndex, repeat, completed]);

  function finish() {
    clearInterval(timerRef.current);
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onComplete) onComplete(pickRandomQuote());
  }

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const progress = phases.length
    ? (repeat * phases.length + phaseIndex + (currentPhase.duration - phaseTime) / currentPhase.duration) /
      (exercise.repeats * phases.length)
    : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circleWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Svg width={220} height={220} viewBox="0 0 220 220" style={styles.svg}>
          <Circle cx="110" cy="110" r="90" stroke={theme.colors.surface} strokeWidth={12} fill="none" />
          <Circle
            cx="110"
            cy="110"
            r="90"
            stroke={theme.colors.accent}
            strokeWidth={12}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin="110, 110"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.action}>{currentPhase.action}</Text>
          <Text style={styles.timer}>{phaseTime}s</Text>
        </View>
      </Animated.View>
      <Text style={styles.instruction}>{currentPhase.instruction || ''}</Text>
      {completed ? <Text style={styles.complete}>Exercício concluído! 🌙</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '600',
  },
  timer: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.xs,
  },
  instruction: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  complete: {
    color: theme.colors.success,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.md,
  },
});

