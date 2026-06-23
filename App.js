import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Vibration,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Button,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Slider from '@react-native-community/slider';

// ----------------------------------
// THEME & CONSTANTS
// ----------------------------------
const COLORS = {
  background: '#1a1a2e',
  card: '#16213e',
  accent: '#0f3460',
  emergency: '#e94560',
  text: '#f5f5f5',
  muted: '#a0a0c0',
  success: '#2ecc71',
  warning: '#f39c12',
  white: '#ffffff',
};

const STORAGE_KEYS = {
  onboarding: '@noite_serena_onboarding',
  user: '@noite_serena_user',
  checkins: '@noite_serena_checkins',
  sleep: '@noite_serena_sleep',
  preferences: '@noite_serena_preferences',
};

const EXERCISES = [
  {
    id: '478',
    name: 'Respiração 4-7-8',
    duration: 76,
    durationLabel: '76s',
    description: 'Para acalmar a mente acelerada',
    type: 'breathing',
    pattern: [
      { phase: 'Inspire', seconds: 4 },
      { phase: 'Segure', seconds: 7 },
      { phase: 'Expire', seconds: 8 },
    ],
    cycles: 4,
  },
  {
    id: 'square',
    name: 'Respiração Quadrada',
    duration: 80,
    durationLabel: '80s',
    description: 'Para focar e reduzir ansiedade',
    type: 'breathing',
    pattern: [
      { phase: 'Inspire', seconds: 4 },
      { phase: 'Segure', seconds: 4 },
      { phase: 'Expire', seconds: 4 },
      { phase: 'Espere', seconds: 4 },
    ],
    cycles: 5,
  },
  {
    id: 'diaphragmatic',
    name: 'Respiração Diafragmática',
    duration: 60,
    durationLabel: '60s',
    description: 'Para relaxamento profundo',
    type: 'breathing',
    pattern: [
      { phase: 'Inspire', seconds: 4 },
      { phase: 'Expire', seconds: 6 },
    ],
    cycles: 6,
  },
  {
    id: 'bodyscan',
    name: 'Scan Corporal',
    duration: 180,
    durationLabel: '3 min',
    description: 'Relaxe cada parte do corpo',
    type: 'guided',
    steps: [
      'Fique confortável...',
      'Feche os olhos...',
      'Concentre-se na cabeça...',
      'Desça para o pescoço...',
      'Relaxe os ombros...',
      'Sinta os braços...',
      'Relaxe as mãos...',
      'Foque no peito...',
      'Abdômen suave...',
      'Quadris e coxas...',
      'Pernas relaxadas...',
      'Pés descansando...',
      'Corpo inteiro leve...',
    ],
  },
  {
    id: 'muscle',
    name: 'Relaxamento Muscular',
    duration: 300,
    durationLabel: '5 min',
    description: 'Liberte a tensão física',
    type: 'guided',
    steps: [
      'Conforte-se na cama...',
      'Aperte os pés por 5s... solte',
      'Aperte as pernas por 5s... solte',
      'Contraia o abdômen... solte',
      'Aperte as mãos... solte',
      'Leve os ombros às orelhas... solte',
      'Feche o rosto apertado... solte',
      'Sinta a leveza do corpo...',
      'Respire naturalmente...',
      'Permita-se relaxar...',
    ],
  },
  {
    id: 'visualization',
    name: 'Visualização Guiada',
    duration: 240,
    durationLabel: '4 min',
    description: 'Imagine seu lugar seguro',
    type: 'guided',
    steps: [
      'Fique confortável...',
      'Imagine um lugar seguro...',
      'Pode ser uma praia, floresta ou quarto...',
      'Veja as cores ao redor...',
      'Ouça os sons desse lugar...',
      'Sinta o toque da temperatura...',
      'Respire a calma do ambiente...',
      'Você está seguro aqui...',
      'Permita-se descansar...',
    ],
  },
];

// ----------------------------------
// CONTEXT
// ----------------------------------
const AppContext = React.createContext(null);

const AppProvider = ({ children }) => {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [user, setUser] = useState({ name: '' });
  const [checkins, setCheckins] = useState({});
  const [sleepRecords, setSleepRecords] = useState({});
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    sound: true,
    bedtime: '22:00',
    waketime: '06:30',
    reminders: false,
    reminderTime: '21:00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [
          onboardingRaw,
          userRaw,
          checkinsRaw,
          sleepRaw,
          prefsRaw,
        ] = await AsyncStorage.multiGet([
          STORAGE_KEYS.onboarding,
          STORAGE_KEYS.user,
          STORAGE_KEYS.checkins,
          STORAGE_KEYS.sleep,
          STORAGE_KEYS.preferences,
        ]);
        if (!mounted) return;
        setOnboardingDone(onboardingRaw[1] === 'true');
        if (userRaw[1]) setUser(JSON.parse(userRaw[1]));
        if (checkinsRaw[1]) setCheckins(JSON.parse(checkinsRaw[1]));
        if (sleepRaw[1]) setSleepRecords(JSON.parse(sleepRaw[1]));
        if (prefsRaw[1]) setPreferences(JSON.parse(prefsRaw[1]));
      } catch (e) {
        console.warn(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const save = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(e);
    }
  };

  const finishOnboarding = async () => {
    setOnboardingDone(true);
    await AsyncStorage.setItem(STORAGE_KEYS.onboarding, 'true');
  };

  const updateUser = async (updates) => {
    const next = { ...user, ...updates };
    setUser(next);
    await save(STORAGE_KEYS.user, next);
  };

  const updatePreferences = async (updates) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    await save(STORAGE_KEYS.preferences, next);
  };

  const addCheckin = async (checkin) => {
    const key = todayKey();
    const next = { ...checkins, [key]: checkin };
    setCheckins(next);
    await save(STORAGE_KEYS.checkins, next);
  };

  const addSleepRecord = async (record) => {
    const key = todayKey();
    const next = { ...sleepRecords, [key]: record };
    setSleepRecords(next);
    await save(STORAGE_KEYS.sleep, next);
  };

  const theme = preferences.theme;

  return (
    <AppContext.Provider
      value={{
        onboardingDone,
        finishOnboarding,
        user,
        updateUser,
        checkins,
        addCheckin,
        sleepRecords,
        addSleepRecord,
        preferences,
        updatePreferences,
        loading,
        theme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// ----------------------------------
// UTILS
// ----------------------------------
function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatHour() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function greeting(name) {
  if (name && name.trim()) return `Boa noite, ${name.trim()}`;
  return 'Boa noite';
}

function anxietyLabel(value) {
  const labels = ['Calmo', 'Leve', 'Moderado', 'Alto', 'Muito alto'];
  return labels[value - 1] || '';
}

function sleepQualityColor(value) {
  if (value <= 2) return COLORS.emergency;
  if (value <= 3) return COLORS.warning;
  return COLORS.success;
}

// ----------------------------------
// SHARED COMPONENTS
// ----------------------------------
function BreathingCircle({ phase, totalSeconds, remainingSeconds }) {
  const scale = useRef(new Animated.Value(1)).current;
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  useEffect(() => {
    scale.setValue(1);
    let target = 1;
    let duration = 0;
    if (phase === 'Inspire') { target = 1.35; duration = remainingSeconds * 1000; }
    else if (phase === 'Expire') { target = 1; duration = remainingSeconds * 1000; }
    else if (phase === 'Segure') { target = 1.35; duration = 0; }
    else if (phase === 'Espere') { target = 1; duration = 0; }

    if (duration > 0) {
      Animated.timing(scale, {
        toValue: target,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: target,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [phase, totalSeconds]);

  return (
    <View style={styles.circleContainer}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }],
            opacity: 0.8 + progress * 0.2,
          },
        ]}
      />
      <Text style={styles.circlePhase}>{phase}</Text>
      <Text style={styles.circleSeconds}>{remainingSeconds}s</Text>
    </View>
  );
}

function SleepChart({ records }) {
  const keys = Object.keys(records).sort().slice(-7);
  const maxHours = 12;
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Últimos 7 dias</Text>
      <View style={styles.barsRow}>
        {keys.map((k) => {
          const r = records[k];
          const heightPct = Math.min((r.hours / maxHours) * 100, 100);
          const day = k.split('-')[2];
          return (
            <View key={k} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: sleepQualityColor(r.quality),
                    },
                  ]}
                />
              </View>
              <Text style={styles.barDay}>{day}</Text>
              <Text style={styles.barHours}>{r.hours}h</Text>
            </View>
          );
        })}
        {keys.length === 0 && (
          <Text style={styles.emptyText}>Sem registros ainda</Text>
        )}
      </View>
    </View>
  );
}

function EmergencyButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.emergencyButton} onPress={onPress}>
      <Text style={styles.emergencyButtonText}>Não estou conseguindo dormir</Text>
    </TouchableOpacity>
  );
}

function CheckInCard({ checkin }) {
  if (!checkin) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Último check-in</Text>
      <Text style={styles.cardText}>Ansiedade: {anxietyLabel(checkin.anxiety)} ({checkin.anxiety}/5)</Text>
      <Text style={styles.cardText}>Cansaço: {checkin.tiredness}/5</Text>
      <Text style={styles.cardText}>Mente: {checkin.mind}</Text>
      {checkin.recommendation && (
        <Text style={styles.recommendationText}>Recomendação: {checkin.recommendation}</Text>
      )}
    </View>
  );
}

function IconButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={onPress}>
      <Text style={styles.iconButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ----------------------------------
// SCREENS
// ----------------------------------
function OnboardingScreen() {
  const { finishOnboarding } = useApp();
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: 'Seu sono importa', text: 'Descanse melhor e acorde com mais calma.' },
    { title: 'Intervenções rápidas para ansiedade', text: 'Exercícios de respiração e relaxamento acessíveis a qualquer hora.' },
    { title: 'Check-in personalizado', text: 'Registre como está se sentindo e receba sugestões sob medida.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.onboardingContent}>
        <Text style={styles.onboardingTitle}>{slides[slide].title}</Text>
        <Text style={styles.onboardingText}>{slides[slide].text}</Text>
      </View>
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === slide && styles.dotActive,
            ]}
          />
        ))}
      </View>
      <View style={styles.onboardingButtons}>
        {slide > 0 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setSlide(slide - 1)}>
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        {slide < slides.length - 1 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setSlide(slide + 1)}>
            <Text style={styles.primaryButtonText}>Próximo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={finishOnboarding}>
            <Text style={styles.primaryButtonText}>Começar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  const { user, checkins, sleepRecords } = useApp();
  const [hour, setHour] = useState(formatHour());
  const lastCheckin = checkins[todayKey()] || Object.values(checkins).sort().pop();

  useEffect(() => {
    const id = setInterval(() => setHour(formatHour()), 30000);
    return () => clearInterval(id);
  }, []);

  const hasMorning = !!sleepRecords[todayKey()];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.homeHeader}>
        <IconButton label="Diário" onPress={() => navigation.navigate('Diário')} />
        <IconButton label="Ajustes" onPress={() => navigation.navigate('Ajustes')} />
      </View>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <Text style={styles.greeting}>{greeting(user.name)}</Text>
        <Text style={styles.clock}>{hour}</Text>
        <TouchableOpacity
          style={styles.bigCard}
          onPress={() => navigation.navigate('CheckIn')}
        >
          <Text style={styles.bigCardIcon}>🌙</Text>
          <Text style={styles.bigCardTitle}>Fazer Check-in Noturno</Text>
          <Text style={styles.bigCardSubtitle}>Avalie sua ansiedade e receba uma sugestão</Text>
        </TouchableOpacity>
        {lastCheckin ? (
          <CheckInCard checkin={lastCheckin} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>Nenhum check-in registrado ainda. Comece hoje!</Text>
          </View>
        )}
        {hasMorning && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registro de hoje</Text>
            <Text style={styles.cardText}>Você já preencheu o diário do sono.</Text>
          </View>
        )}
      </ScrollView>
      <EmergencyButton
        onPress={() => {
          Alert.alert('Noite Serena', 'Tente a Respiração 4-7-8. Inspire 4s, segure 7s e expire 8s. Você está seguro.');
          navigation.navigate('Player', { exercise: EXERCISES[0] });
        }}
      />
    </SafeAreaView>
  );
}

function CheckInScreen({ navigation }) {
  const { addCheckin } = useApp();
  const [step, setStep] = useState(1);
  const [anxiety, setAnxiety] = useState(3);
  const [tiredness, setTiredness] = useState(3);
  const [mind, setMind] = useState('Nada específico');
  const [recommendation, setRecommendation] = useState(null);

  const minds = ['Trabalho', 'Preocupações', 'Saúde', 'Família', 'Relacionamentos', 'Nada específico'];

  const finish = () => {
    let rec = '';
    let exercise = null;
    if (anxiety >= 4) {
      rec = 'Respiração 4-7-8 para acalmar a mente';
      exercise = EXERCISES[0];
    } else if (anxiety >= 2) {
      rec = 'Relaxamento muscular ou scan corporal';
      exercise = EXERCISES[3];
    } else if (tiredness >= 4) {
      rec = 'Áudio curto de relaxamento';
      exercise = EXERCISES[2];
    } else {
      rec = 'Respiração diafragmática suave';
      exercise = EXERCISES[2];
    }
    setRecommendation({ rec, exercise });
    addCheckin({ anxiety, tiredness, mind, recommendation: rec, date: todayKey() });
    setStep(4);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Check-in Noturno</Text>
      </View>
      {step === 1 && (
        <View style={styles.checkinStep}>
          <Text style={styles.question}>Seu nível de ansiedade agora:</Text>
          <Text style={styles.questionLabel}>{anxietyLabel(anxiety)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={anxiety}
            onValueChange={setAnxiety}
            minimumTrackTintColor={COLORS.emergency}
            maximumTrackTintColor={COLORS.accent}
            thumbTintColor={COLORS.white}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 2 && (
        <View style={styles.checkinStep}>
          <Text style={styles.question}>Seu nível de cansaço:</Text>
          <Text style={styles.questionLabel}>{anxietyLabel(tiredness)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={tiredness}
            onValueChange={setTiredness}
            minimumTrackTintColor={COLORS.warning}
            maximumTrackTintColor={COLORS.accent}
            thumbTintColor={COLORS.white}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(3)}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 3 && (
        <View style={styles.checkinStep}>
          <Text style={styles.question}>O que está ocupando sua mente?</Text>
          <View style={styles.optionsGrid}>
            {minds.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.optionButton,
                  mind === m && styles.optionButtonSelected,
                ]}
                onPress={() => setMind(m)}
              >
                <Text style={styles.optionButtonText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={finish}>
            <Text style={styles.primaryButtonText}>Ver recomendação</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 4 && recommendation && (
        <View style={styles.checkinStep}>
          <Text style={styles.question}>Recomendação para você</Text>
          <View style={styles.card}>
            <Text style={styles.recommendationText}>{recommendation.rec}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.replace('Player', { exercise: recommendation.exercise })}
          >
            <Text style={styles.primaryButtonText}>Iniciar Exercício</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function PlayerScreen({ route, navigation }) {
  const exercise = route.params?.exercise || EXERCISES[0];
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [totalRemaining, setTotalRemaining] = useState(exercise.duration);
  const [phaseRemaining, setPhaseRemaining] = useState(0);
  const [phase, setPhase] = useState('Prepare-se');
  const [cycle, setCycle] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);
  const phaseRef = useRef(null);

  const startBreathing = () => {
    if (exercise.type === 'breathing') {
      setCycle(0);
      nextPhase(0, 0);
    } else {
      setPhase(exercise.steps[0]);
      setPhaseRemaining(exercise.duration / exercise.steps.length);
      setTotalRemaining(exercise.duration);
      setStepIndex(0);
    }
    setRunning(true);
  };

  const nextPhase = (c, p) => {
    if (c >= exercise.cycles) {
      finish();
      return;
    }
    const pattern = exercise.pattern;
    const step = pattern[p % pattern.length];
    setPhase(step.phase);
    setPhaseRemaining(step.seconds);
    setCycle(c);
    phaseRef.current = { c, p, seconds: step.seconds };
  };

  const finish = () => {
    setRunning(false);
    setFinished(true);
    setPhase('Concluído');
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTotalRemaining((tr) => {
        if (tr <= 1) {
          finish();
          return 0;
        }
        return tr - 1;
      });
      setPhaseRemaining((pr) => {
        if (pr <= 1) {
          if (exercise.type === 'breathing') {
            const current = phaseRef.current || { c: 0, p: 0 };
            const pattern = exercise.pattern;
            const nextP = (current.p + 1) % pattern.length;
            const nextC = nextP === 0 ? current.c + 1 : current.c;
            if (nextC >= exercise.cycles) {
              finish();
              return 0;
            }
            nextPhase(nextC, nextP);
            return 0;
          } else {
            setStepIndex((si) => {
              const next = si + 1;
              if (next >= exercise.steps.length) {
                finish();
                return si;
              }
              setPhase(exercise.steps[next]);
              return next;
            });
            return Math.max(1, Math.floor(exercise.duration / exercise.steps.length));
          }
        }
        return pr - 1;
      });
      Vibration.vibrate(50);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, exercise]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
      </View>
      <View style={styles.playerContent}>
        {exercise.type === 'breathing' && !finished ? (
          <BreathingCircle
            phase={phase}
            totalSeconds={phaseRef.current?.seconds || 4}
            remainingSeconds={phaseRemaining}
          />
        ) : (
          <View style={styles.guidedContainer}>
            <Text style={styles.guidedPhase}>{phase}</Text>
          </View>
        )}
        <Text style={styles.timerText}>
          {finished ? 'Concluído' : formatTime(totalRemaining)}
        </Text>
        {!finished && (
          <Text style={styles.cycleText}>
            {exercise.type === 'breathing' ? `Ciclo ${cycle + 1} de ${exercise.cycles}` : `Passo ${stepIndex + 1} de ${exercise.steps.length}`}
          </Text>
        )}
        {finished ? (
          <View style={styles.finishedBox}>
            <Text style={styles.finishedText}>Muito bem! Você deu um passo para descansar.</Text>
            <Text style={styles.finishedSub}>Hora de guardar o celular.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playerControls}>
            {!running ? (
              <TouchableOpacity style={styles.primaryButton} onPress={startBreathing}>
                <Text style={styles.primaryButtonText}>Iniciar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setRunning(false)}>
                <Text style={styles.secondaryButtonText}>Pausar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function DiaryScreen({ navigation }) {
  const { sleepRecords, addSleepRecord } = useApp();
  const key = todayKey();
  const todayRecord = sleepRecords[key];
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [waking, setWaking] = useState('Cansado(a)');

  const save = () => {
    addSleepRecord({ hours, quality, waking, date: key });
  };

  const all = Object.entries(sleepRecords).sort(([a], [b]) => a.localeCompare(b)).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Diário do Sono</Text>
        {!todayRecord ? (
          <View style={styles.card}>
            <Text style={styles.question}>Quantas horas dormiu?</Text>
            <Text style={styles.questionLabel}>{hours} horas</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={12}
              step={0.5}
              value={hours}
              onValueChange={setHours}
              minimumTrackTintColor={COLORS.success}
              maximumTrackTintColor={COLORS.accent}
              thumbTintColor={COLORS.white}
            />
            <Text style={styles.question}>Qualidade do sono:</Text>
            <Text style={styles.questionLabel}>{quality}/5</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={quality}
              onValueChange={setQuality}
              minimumTrackTintColor={sleepQualityColor(quality)}
              maximumTrackTintColor={COLORS.accent}
              thumbTintColor={COLORS.white}
            />
            <Text style={styles.question}>Como acordou?</Text>
            <View style={styles.optionsRow}>
              {['Disposto(a)', 'Cansado(a)', 'Muito cansado(a)'].map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.optionButtonSmall,
                    waking === w && styles.optionButtonSelected,
                  ]}
                  onPress={() => setWaking(w)}
                >
                  <Text style={styles.optionButtonText}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={save}>
              <Text style={styles.primaryButtonText}>Salvar registro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registro de hoje</Text>
            <Text style={styles.cardText}>Horas: {todayRecord.hours}</Text>
            <Text style={styles.cardText}>Qualidade: {todayRecord.quality}/5</Text>
            <Text style={styles.cardText}>Acordou: {todayRecord.waking}</Text>
          </View>
        )}
        <SleepChart records={sleepRecords} />
        <Text style={styles.sectionTitle}>Histórico</Text>
        {all.map(([k, r]) => (
          <View key={k} style={styles.listItem}>
            <Text style={styles.listDate}>{k}</Text>
            <Text style={styles.listText}>{r.hours}h · Qualidade {r.quality}/5 · {r.waking}</Text>
          </View>
        ))}
        {all.length === 0 && <Text style={styles.emptyText}>Nenhum registro ainda.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function LibraryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Biblioteca de Exercícios</Text>
        <View style={styles.exerciseGrid}>
          {EXERCISES.map((ex) => (
            <TouchableOpacity
              key={ex.id}
              style={styles.exerciseCard}
              onPress={() => navigation.navigate('Player', { exercise: ex })}
            >
              <Text style={styles.exerciseIcon}>{ex.type === 'breathing' ? '🧘' : '✨'}</Text>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseDuration}>{ex.durationLabel}</Text>
              <Text style={styles.exerciseDesc}>{ex.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsScreen({ navigation }) {
  const { user, updateUser, preferences, updatePreferences } = useApp();
  const [name, setName] = useState(user.name);
  const [bedtime, setBedtime] = useState(preferences.bedtime);
  const [waketime, setWaketime] = useState(preferences.waketime);
  const [reminders, setReminders] = useState(preferences.reminders);
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime);
  const [theme, setTheme] = useState(preferences.theme);
  const [sound, setSound] = useState(preferences.sound);
  const [aboutVisible, setAboutVisible] = useState(false);

  const save = () => {
    updateUser({ name });
    updatePreferences({ bedtime, waketime, reminders, reminderTime, theme, sound });
    Alert.alert('Noite Serena', 'Preferências salvas.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={styles.card}>
          <Text style={styles.question}>Seu nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Como gostaria de ser chamado?"
            placeholderTextColor={COLORS.muted}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>Horário ideal para dormir</Text>
          <TextInput
            style={styles.input}
            value={bedtime}
            onChangeText={setBedtime}
            placeholder="22:00"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.question}>Horário ideal para acordar</Text>
          <TextInput
            style={styles.input}
            value={waketime}
            onChangeText={setWaketime}
            placeholder="06:30"
            placeholderTextColor={COLORS.muted}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>Lembretes noturnos</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.cardText}>{reminders ? 'Ativados' : 'Desativados'}</Text>
            <TouchableOpacity
              style={[styles.toggle, reminders && styles.toggleActive]}
              onPress={() => setReminders(!reminders)}
            />
          </View>
          {reminders && (
            <TextInput
              style={styles.input}
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="21:00"
              placeholderTextColor={COLORS.muted}
            />
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>Tema</Text>
          <View style={styles.optionsRow}>
            {['dark', 'light', 'system'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.optionButtonSmall,
                  theme === t && styles.optionButtonSelected,
                ]}
                onPress={() => setTheme(t)}
              >
                <Text style={styles.optionButtonText}>
                  {t === 'dark' ? 'Escuro' : t === 'light' ? 'Claro' : 'Sistema'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.question}>Som</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.cardText}>{sound ? 'Ligado' : 'Desligado'}</Text>
            <TouchableOpacity
              style={[styles.toggle, sound && styles.toggleActive]}
              onPress={() => setSound(!sound)}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setAboutVisible(true)}>
          <Text style={styles.secondaryButtonText}>Sobre / Isenção de responsabilidade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={save}>
          <Text style={styles.primaryButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={aboutVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sobre</Text>
            <Text style={styles.modalText}>
              Noite Serena é um app de apoio para quem tem dificuldade para dormir por ansiedade. Não substitui acompanhamento médico ou psicológico. Em caso de crise persistente, procure um profissional de saúde.
            </Text>
            <Button title="Fechar" onPress={() => setAboutVisible(false)} color={COLORS.emergency} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ----------------------------------
// NAVIGATION
// ----------------------------------
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.accent },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.muted,
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
        options={{ tabBarIcon: () => <Text style={styles.tabIcon}>🌙</Text> }}
      />
      <Tab.Screen
        name="Exercícios"
        component={LibraryScreen}
        options={{ tabBarIcon: () => <Text style={styles.tabIcon}>🧘</Text> }}
      />
      <Tab.Screen
        name="Diário"
        component={DiaryScreen}
        options={{ tabBarIcon: () => <Text style={styles.tabIcon}>📊</Text> }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{ tabBarIcon: () => <Text style={styles.tabIcon}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { onboardingDone, loading } = useApp();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingDone && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

// ----------------------------------
// STYLES
// ----------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  homeContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerRow: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  iconButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  iconButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },
  clock: {
    color: COLORS.muted,
    fontSize: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  bigCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  bigCardIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  bigCardTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  bigCardSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  recommendationText: {
    color: COLORS.success,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.emergency,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  onboardingTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingText: {
    color: COLORS.muted,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 12,
    height: 12,
  },
  onboardingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  checkinStep: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  question: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  questionLabel: {
    color: COLORS.muted,
    fontSize: 16,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.white,
  },
  optionButtonText: {
    color: COLORS.text,
    fontSize: 15,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
    marginVertical: 20,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accent,
    position: 'absolute',
  },
  circlePhase: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    zIndex: 1,
  },
  circleSeconds: {
    color: COLORS.muted,
    fontSize: 18,
    marginTop: 8,
    zIndex: 1,
  },
  playerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  guidedContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  guidedPhase: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerText: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '700',
    marginTop: 20,
  },
  cycleText: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 8,
  },
  playerControls: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 16,
  },
  finishedBox: {
    alignItems: 'center',
    padding: 20,
  },
  finishedText: {
    color: COLORS.success,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  finishedSub: {
    color: COLORS.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 24,
    height: 100,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barDay: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },
  barHours: {
    color: COLORS.text,
    fontSize: 11,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  listItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  listDate: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 4,
  },
  listText: {
    color: COLORS.text,
    fontSize: 15,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButtonSmall: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    width: Dimensions.get('window').width / 2 - 27,
    minHeight: 160,
  },
  exerciseIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  exerciseName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseDuration: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  exerciseDesc: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  tabIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
});
