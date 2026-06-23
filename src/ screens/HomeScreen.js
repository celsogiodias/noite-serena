import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { useSleepData } from '../hooks/useSleepData';
import AnxietyScale from '../components/AnxietyScale';
import SleepChart from '../components/SleepChart';
import EmergencyButton from '../components/EmergencyButton';
import { theme } from '../theme';
import { getGreeting, getRecommendation, formatHours, isSameDay } from '../utils/sleepUtils';
import { saveCheckin } from '../services/firebase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, lastCheckin, todayRecommendation, setCheckin, setRecommendation } = useAppContext();
  const { logs, saveLog } = useSleepData(user?.uid);
  const [anxiety, setAnxiety] = useState(null);

  const today = new Date();
  const didCheckinToday = lastCheckin && isSameDay(new Date(lastCheckin.date), today);

  useEffect(() => {
    if (didCheckinToday && todayRecommendation) {
      setAnxiety(lastCheckin?.anxiety || null);
    }
  }, [didCheckinToday, lastCheckin, todayRecommendation]);

  async function handleAnxietySelect(level) {
    setAnxiety(level);
    const checkin = { date: new Date().toISOString(), anxiety: level, fatigue: 0, mind: '' };
    await setCheckin(checkin);
    try {
      await saveCheckin(user.uid, checkin);
    } catch (e) {
      console.warn('Checkin não salvo no Firebase:', e);
    }
  }

  async function startRoutine() {
    if (!anxiety) return;
    const recommendationId = getRecommendation(anxiety, 2);
    await setRecommendation({ id: recommendationId, date: new Date().toISOString() });
    navigation.navigate('ExercisePlayer', { exerciseId: recommendationId });
  }

  function goToEmergency() {
    navigation.navigate('Checkin', { emergency: true });
  }

  const recentLogs = logs.slice(0, 3);

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, Celso</Text>
          <Text style={styles.subtitle}>Vamos preparar a mente para uma noite tranquila?</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como você está se sentindo agora?</Text>
          <AnxietyScale value={anxiety} onSelect={handleAnxietySelect} />
        </View>

        {anxiety && !didCheckinToday ? (
          <TouchableOpacity onPress={startRoutine} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Iniciar Rotina Noturna</Text>
          </TouchableOpacity>
        ) : null}

        {didCheckinToday && todayRecommendation ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recomendação de hoje</Text>
            <Text style={styles.recommendationText}>
              Exercício sugerido: {todayRecommendation.id}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExercisePlayer', { exerciseId: todayRecommendation.id })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sua semana</Text>
          <SleepChart logs={recentLogs} days={3} compact />
          <Text style={styles.hint}>Média: {formatHours(logs.reduce((a, b) => a + (Number(b.hours) || 0), 0) / (logs.length || 1))}</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.emergencyContainer}>
        <EmergencyButton onPress={goToEmergency} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  recommendationText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.sm,
  },
  spacer: {
    height: 120,
  },
  emergencyContainer: {
    position: 'absolute',
    bottom: 90,
    right: theme.spacing.md,
    left: theme.spacing.md,
    alignItems: 'center',
  },
});

