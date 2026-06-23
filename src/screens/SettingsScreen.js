import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { saveSleepLog } from '../services/firebase';
import {
  scheduleSleepReminder,
  scheduleMorningReminder,
  cancelAllScheduledNotifications,
} from '../services/notifications';
import { theme } from '../theme';

const SETTINGS_KEY = '@noite_serena:settings';

export default function SettingsScreen() {
  const { user } = useAppContext();
  const [settings, setSettings] = useState({
    sleepTime: '22:00',
    wakeTime: '07:00',
    goalHours: 8,
    nightReminder: true,
    nightReminderTime: '21:30',
    morningReminder: true,
    morningReminderTime: '08:00',
    volume: 1,
    speed: 1,
    backgroundAudio: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function persist(newSettings) {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      await updateNotifications(newSettings);
      if (user?.uid) {
        await saveSleepLog(user.uid, { type: 'settings', ...newSettings, timestamp: new Date().toISOString() });
      }
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  }

  async function updateNotifications(s) {
    await cancelAllScheduledNotifications();
    if (s.nightReminder) {
      const [hour, minute] = s.nightReminderTime.split(':').map(Number);
      await scheduleSleepReminder(hour, minute);
    }
    if (s.morningReminder) {
      const [hour, minute] = s.morningReminderTime.split(':').map(Number);
      await scheduleMorningReminder(hour, minute);
    }
  }

  function update(key, value) {
    const newSettings = { ...settings, [key]: value };
    persist(newSettings);
  }

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Ajustes</Text>

      <Section title="Sono">
        <Row label="Horário ideal para dormir" value={settings.sleepTime} />
        <Row label="Horário ideal para acordar" value={settings.wakeTime} />
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Meta de horas: {settings.goalHours}h</Text>
          <View style={styles.fakeSlider}>
            {[6, 7, 8, 9].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => update('goalHours', h)}
                style={[styles.hourPill, settings.goalHours === h && styles.hourPillActive]}
              >
                <Text style={styles.hourPillText}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Section>

      <Section title="Lembretes">
        <ToggleRow
          label="Lembrete noturno"
          value={settings.nightReminder}
          onChange={(v) => update('nightReminder', v)}
          time={settings.nightReminderTime}
          onTimeChange={(t) => update('nightReminderTime', t)}
        />
        <ToggleRow
          label="Lembrete matinal"
          value={settings.morningReminder}
          onChange={(v) => update('morningReminder', v)}
          time={settings.morningReminderTime}
          onTimeChange={(t) => update('morningReminderTime', t)}
        />
      </Section>

      <Section title="Áudio">
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Volume: {Math.round(settings.volume * 100)}%</Text>
          <View style={styles.fakeSlider}>
            {[0, 25, 50, 75, 100].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => update('volume', p / 100)}
                style={[styles.hourPill, Math.round(settings.volume * 100) === p && styles.hourPillActive]}
              >
                <Text style={styles.hourPillText}>{p}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Velocidade</Text>
          <View style={styles.fakeSlider}>
            {[0.75, 1, 1.25].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => update('speed', s)}
                style={[styles.hourPill, settings.speed === s && styles.hourPillActive]}
              >
                <Text style={styles.hourPillText}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Áudio continua com tela bloqueada</Text>
          <Switch
            value={settings.backgroundAudio}
            onValueChange={(v) => update('backgroundAudio', v)}
            trackColor={{ false: theme.colors.primary, true: theme.colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </Section>

      <Section title="Sobre">
        <Text style={styles.version}>Versão 1.0.0</Text>
        <Text style={styles.disclaimer}>
          Este app não substitui acompanhamento médico ou psicológico. Consulte um profissional se seus
          problemas de sono persistirem por mais de 3 meses.
        </Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Política de privacidade</Text>
        </TouchableOpacity>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.timeInput}
        value={value}
        editable={false}
        placeholderTextColor={theme.colors.textSecondary}
      />
    </View>
  );
}

function ToggleRow({ label, value, onChange, time, onTimeChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.toggleInfo}>
        <Text style={styles.label}>{label}</Text>
        {value ? (
          <TextInput
            style={styles.timeInput}
            value={time}
            onChangeText={onTimeChange}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textSecondary}
          />
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.primary, true: theme.colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  toggleInfo: {
    flexDirection: 'column',
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  timeInput: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.textSecondary,
    minWidth: 60,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  sliderRow: {
    paddingVertical: theme.spacing.sm,
  },
  fakeSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  hourPill: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  hourPillActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  hourPillText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  version: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  linkButton: {
    paddingVertical: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
  },
});

