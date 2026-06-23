import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { breathingExercises } from '../utils/breathingExercises';
import { theme } from '../theme';

const categories = [
  { title: 'Respiração', items: breathingExercises },
  { title: 'Relaxamento', items: [] },
  { title: 'Áudios', items: [] },
];

const cardColors = [theme.colors.primary, theme.colors.accent, theme.colors.emergency];

export default function LibraryScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Respiração');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Biblioteca de Exercícios</Text>

      {categories.map((category) => (
        <View key={category.title}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.grid}>
            {category.items.length > 0 ? (
              category.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate('ExercisePlayer', { exerciseId: item.id })}
                  style={[
                    styles.card,
                    { backgroundColor: cardColors[index % cardColors.length] },
                  ]}
                >
                  <Text style={styles.icon}>{item.icon === 'wind' ? '💨' : item.icon === 'square' ? '⬜' : '🫁'}</Text>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.duration}>{item.duration}s</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.empty}>Em breve novos conteúdos.</Text>
            )}
          </View>
        </View>
      ))}
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
  categoryTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  icon: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    color: '#fff',
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  duration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.sm,
  },
  empty: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.md,
  },
});

