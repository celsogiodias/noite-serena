import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '../theme';
import { formatHours, getDayLabel } from '../utils/sleepUtils';

const MAX_HOURS = 12;
const BAR_WIDTH = 28;
const CHART_HEIGHT = 140;

export default function SleepChart({ logs, days = 7, compact = false }) {
  const today = new Date();
  const daysList = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    daysList.push(d);
  }

  const chartData = daysList.map((day) => {
    const dateStr = day.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === dateStr || l.date?.startsWith(dateStr));
    return {
      day: getDayLabel(day, true),
      hours: log ? Number(log.hours) || 0 : 0,
      quality: log ? Number(log.quality) || 0 : 0,
    };
  });

  const barColor = (quality) => {
    if (quality >= 4) return theme.colors.success;
    if (quality >= 3) return theme.colors.warning;
    if (quality > 0) return theme.colors.emergency;
    return theme.colors.textSecondary;
  };

  const gap = 12;
  const totalWidth = days * (BAR_WIDTH + gap) + gap;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={styles.title}>{compact ? 'Sua semana' : 'Últimos 7 dias'}</Text>
      <Svg width={totalWidth} height={CHART_HEIGHT + 32}>
        {chartData.map((item, index) => {
          const height = item.hours ? (item.hours / MAX_HOURS) * CHART_HEIGHT : 4;
          const x = gap + index * (BAR_WIDTH + gap);
          const y = CHART_HEIGHT - height;
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={height}
                rx={6}
                fill={barColor(item.quality)}
              />
              <Text style={[styles.barValue, { left: x, top: y - 20, width: BAR_WIDTH }]}>
                {item.hours ? formatHours(item.hours) : ''}
              </Text>
              <Text style={[styles.barLabel, { left: x, top: CHART_HEIGHT + 8, width: BAR_WIDTH }]}>
                {item.day}
              </Text>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  compact: {
    padding: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  barValue: {
    position: 'absolute',
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
  barLabel: {
    position: 'absolute',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
});
