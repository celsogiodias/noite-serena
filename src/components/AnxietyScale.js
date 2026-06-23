import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

const levels = [
  { label: 'Relaxado', emoji: '😌', color: theme.colors.success },
  { label: 'Calmo', emoji: '😐', color: '#a3e635' },
  { label: 'Inquieto', emoji: '😟', color: theme.colors.warning },
  { label: 'Tenso', emoji: '😰', color: '#fb923c' },
  { label: 'Muito ansioso', emoji: '😱', color: theme.colors.emergency },
];

export default function AnxietyScale({ value, onSelect, label, disabled = false }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {levels.map((item, index) => {
          const level = index + 1;
          const selected = value === level;
          return (
            <TouchableOpacity
              key={level}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onSelect(level)}
              style={[
                styles.bubble,
                selected && { backgroundColor: item.color, borderColor: item.color },
              ]}
            >
              <Text style={[styles.emoji, selected && styles.emojiSelected]}>{item.emoji}</Text>
              {selected ? <Text style={styles.selectedLabel}>{item.label}</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>Toque no emoji que melhor descreve você</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  emoji: {
    fontSize: 26,
  },
  emojiSelected: {
    fontSize: 28,
  },
  selectedLabel: {
    position: 'absolute',
    bottom: -22,
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    textAlign: 'center',
    width: 80,
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
