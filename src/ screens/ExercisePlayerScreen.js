import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BreathingCircle from '../components/BreathingCircle';
import { breathingExercises } from '../utils/breathingExercises';
import { theme } from '../theme';
import { pickRandomQuote } from '../utils/sleepUtils';

const { height } = Dimensions.get('window');

export default function ExercisePlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId } = route.params || {};
  const exercise =
    breathingExercises.find((e) => e.id === exerciseId) || breathingExercises[0];

  const [isActive, setIsActive] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [quote, setQuote] = useState(pickRandomQuote());

  const handleComplete = useCallback((q) => {
    setQuote(q || pickRandomQuote());
    setShowCompletion(true);
  }, []);

  function togglePause() {
    setIsActive((prev) => !prev);
  }

  function handleSkip() {
    Alert.alert('Pular exercício', 'Tem certeza que deseja interromper?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Pular',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  function closeCompletion() {
    setShowCompletion(false);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.duration}>Exercício de {exercise.duration} segundos</Text>

      <BreathingCircle exercise={exercise} isActive={isActive} onComplete={handleComplete} />

      <Text style={styles.instruction}>{exercise.description}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePause} style={styles.controlButton}>
          <Text style={styles.controlText}>{isActive ? 'Pausar' : 'Continuar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCompletion} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parabéns! 🌙</Text>
            <Text style={styles.modalQuote}>“{quote}”</Text>
            <Text style={styles.modalSuggestion}>Hora de dormir</Text>
            <TouchableOpacity onPress={closeCompletion} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Voltar para o início</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  duration: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  controlButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.md,
  },
  controlText: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  skipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '90%',
    maxHeight: height * 0.5,
  },
  modalTitle: {
    color: theme.colors.success,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  modalQuote: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  modalSuggestion: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.lg,
  },
  modalButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
