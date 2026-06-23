import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useSleepData } from '../hooks/useSleepData';
import AnxietyScale from '../components/AnxietyScale';
import SleepChart from '../components/SleepChart';
import { theme } from '../theme';
import { formatHours, getQualityLabel, getDayLabel } from '../utils/sleepUtils';

const wakeOptions = ['Disposto(a)', 'Cansado(a)', 'Muito cansado(a)'];

export default function SleepDiaryScreen() {
  const { user } = useAppContext();
  const { logs, averageHours, averageQuality, saveLog, todayLog, refresh } = useSleepData(user?.uid);
  const [hours, setHours] = useState(todayLog ? String(todayLog.hours) : '');
  const [quality, setQuality] = useState(todayLog ? Number(todayLog.quality) : null);
  const [wakeup, setWakeup] = useState(todayLog ? todayLog.wakeup || '' : '');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(!todayLog);

  async function handleSave() {
    if (!hours || !quality || !wakeup) return;
    setSaving(true);
    try {
      await saveLog({ hours: Number(hours), quality, wakeup });
      setEditMode(false);
    } catch (error) {
      alert('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Diário do sono</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hoje</Text>
        {editMode ? (
          <>
            <Text style={styles.label}>Quantas horas dormiu?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={hours}
              onChangeText={setHours}
              placeholder="Ex: 7.5"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.label}>Como avalia a qualidade?</Text>
            <AnxietyScale value={quality} onSelect={setQuality} />

            <Text style={styles.label}>Como acordou?</Text>
            <View style={styles.wakeRow}>
              {wakeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setWakeup(option)}
                  style={[styles.wakeOption, wakeup === option && styles.wakeActive]}
                >
                  <Text style={styles.wakeText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !hours || !quality || !wakeup}
              style={[styles.saveButton, (!hours || !quality || !wakeup) && styles.disabled]}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.summaryText}>Horas: {formatHours(Number(todayLog?.hours || 0))}</Text>
            <Text style={styles.summaryText}>
              Qualidade: {getQualityLabel(Number(todayLog?.quality || 0))}
            </Text>
            <Text style={styles.summaryText}>Acordou: {todayLog?.wakeup || '-'}</Text>
            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimos 7 dias</Text>
        <SleepChart logs={logs} days={7} />
        <Text style={styles.averages}>
          Média: {formatHours(averageHours)} · Qualidade: {averageQuality.toFixed(1)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico</Text>
        {logs.length === 0 ? (
          <Text style={styles.empty}>Nenhum registro ainda. Comece hoje!</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logDate}>{log.date || getDayLabel(new Date(log.timestamp))}</Text>
              <Text style={styles.logHours}>{formatHours(Number(log.hours))}</Text>
              <Text style={styles.logQuality}>{getQualityLabel(Number(log.quality))}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  wakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  wakeOption: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  wakeActive: {
    backgroundColor: theme.colors.accent,
  },
  wakeText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  saveButtonText: {
    color: '#000',
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  summaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  averages: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.sm,
  },
  empty: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
  },
  logDate: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  logHours: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  logQuality: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
  },
});

