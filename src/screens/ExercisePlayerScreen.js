import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BreathingCircle from '../components/BreathingCircle';
import { breathingExercises } from '../utils/breathingExercises';
import { pickRandomQuote } from '../utils/sleepUtils';
import theme from '../theme';

const ExercisePlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId } = route.params || {};

  const exercise =
    breathingExercises.find((item) => item.id === exerciseId) ||
    breathingExercises[0] ||
    null;

  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (!exercise) {
      console.error('Nenhum exercício de respiração disponível.');
    }
  }, [exercise]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Exercício não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const totalDuration = exercise.duration || exercise.totalDuration || '5 min';

  const handleToggle = () => {
    setIsActive((prev) => !prev);
  };

  const handleSkip = () => {
    Alert.alert(
      'Interromper exercício',
      'Tem certeza que deseja interromper?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Pular',
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleComplete = () => {
    setIsActive(false);
    setQuote(pickRandomQuote());
    setCompleted(true);
  };

  const handleGoBack = () => {
    setCompleted(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.duration}>Duração total: {totalDuration}</Text>

        <View style={styles.circleContainer}>
          <BreathingCircle
            exercise={exercise}
            isActive={isActive}
            onComplete={handleComplete}
          />
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleToggle}
          >
            <Text style={styles.buttonText}>
              {isActive ? 'Pausar' : 'Continuar'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
          >
            <Text style={styles.buttonText}>Pular</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={completed}
        onRequestClose={handleGoBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parabéns! 🌙</Text>
            <Text style={styles.modalQuote}>"{quote}"</Text>
            <Text style={styles.modalSuggestion}>Hora de dormir</Text>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleGoBack}
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    color: theme.colors?.text || '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  duration: {
    color: theme.colors?.textSecondary || '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors?.primary || '#533483',
  },
  secondaryButton: {
    backgroundColor: theme.colors?.surface || '#16213e',
    borderWidth: 1,
    borderColor: theme.colors?.primary || '#533483',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e94560',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors?.surface || '#16213e',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    color: theme.colors?.text || '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalQuote: {
    color: theme.colors?.textSecondary || '#e0e0e0',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalSuggestion: {
    color: theme.colors?.accent || '#e94560',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default ExercisePlayerScreen;
