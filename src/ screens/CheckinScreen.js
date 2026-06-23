import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import AnxietyScale from '../components/AnxietyScale';
import { theme } from '../theme';
import { getRecommendation } from '../utils/sleepUtils';
import { saveCheckin } from '../services/firebase';

const { width } = Dimensions.get('window');

const mindOptions = ['Trabalho', 'Preocupações', 'Saúde', 'Família', 'Relacionamentos', 'Outro'];

export default function CheckinScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, setCheckin, setRecommendation } = useAppContext();
  const [step, setStep] = useState(1);
  const [anxiety, setAnxiety] = useState(route.params?.emergency ? 5 : null);
  const [fatigue, setFatigue] = useState(null);
  const [mind, setMind] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  function animateOut(direction, callback) {
    Animated.timing(slideAnim, {
      toValue: direction * width,
      duration: 250,
      useNativeDriver: true,
    }).start(callback);
  }

  function nextStep() {
    animateOut(-1, () => {
      setStep((s) => s + 1);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
  }

  function prevStep() {
    animateOut(1, () => {
      setStep((s) => s - 1);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
  }

  async function finish() {
    const checkin = {
      date: new Date().toISOString(),
      anxiety,
      fatigue,
      mind,
    };
    await setCheckin(checkin);
    try {
      await saveCheckin(user.uid, checkin);
    } catch (e) {
      console.warn('Checkin não salvo no Firebase:', e);
    }
    const recommendationId = getRecommendation(anxiety, fatigue);
    await setRecommendation({ id: recommendationId, date: new Date().toISOString() });
    navigation.replace('ExercisePlayer', { exerciseId: recommendationId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Check-in noturno</Text>
      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        {step === 1 && (
          <View>
            <Text style={styles.question}>Qual seu nível de ansiedade agora?</Text>
            <AnxietyScale value={anxiety} onSelect={setAnxiety} />
          </View>
        )}
        {step === 2 && (
          <View>
            <Text style={styles.question}>Como está seu cansaço físico?</Text>
            <AnxietyScale value={fatigue} onSelect={setFatigue} />
          </View>
        )}
        {step === 3 && (
          <View>
            <Text style={styles.question}>O que está ocupando sua mente?</Text>
            <ScrollView contentContainerStyle={styles.optionsGrid}>
              {mindOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setMind(option)}
                  style={[styles.option, mind === option && styles.optionActive]}
                >
                  <Text style={[styles.optionText, mind === option && styles.optionTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity onPress={prevStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        {step < 3 ? (
          <TouchableOpacity
            onPress={nextStep}
            disabled={step === 1 ? !anxiety : !fatigue}
            style={[styles.nextButton, step === 1 ? !anxiety && styles.disabled : !fatigue && styles.disabled]}
          >
            <Text style={styles.nextButtonText}>Avançar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={finish}
            disabled={!mind}
            style={[styles.nextButton, !mind && styles.disabled]}
          >
            <Text style={styles.nextButtonText}>Iniciar Exercício Recomendado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  header: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
  },
  question: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: theme.colors.accent,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  optionTextActive: {
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.md,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  nextButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});
