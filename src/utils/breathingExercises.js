export const breathingExercises = [
  {
    id: '478',
    name: '4-7-8',
    description: 'Para ansiedade aguda',
    duration: 60,
    phases: [
      { action: 'Inspire', duration: 4, instruction: 'Inspire pelo nariz contando até 4' },
      { action: 'Segure', duration: 7, instruction: 'Segure a respiração contando até 7' },
      { action: 'Expire', duration: 8, instruction: 'Expire pela boca contando até 8' }
    ],
    repeats: 4,
    icon: 'wind'
  },
  {
    id: 'square',
    name: 'Respiração Quadrada',
    description: 'Para mente acelerada',
    duration: 64,
    phases: [
      { action: 'Inspire', duration: 4, instruction: 'Inspire pelo nariz' },
      { action: 'Segure', duration: 4, instruction: 'Segure a respiração' },
      { action: 'Expire', duration: 4, instruction: 'Expire pela boca' },
      { action: 'Segure', duration: 4, instruction: 'Segure os pulmões vazios' }
    ],
    repeats: 4,
    icon: 'square'
  },
  {
    id: 'diaphragmatic',
    name: 'Respiração Diafragmática',
    description: 'Para tensão geral',
    duration: 120,
    phases: [
      { action: 'Inspire', duration: 4, instruction: 'Expanda a barriga como um balão' },
      { action: 'Expire', duration: 6, instruction: 'Esvazie devagar pela boca' }
    ],
    repeats: 12,
    icon: 'activity'
  }
];

// Mapeia nível de ansiedade para exercício recomendado
export function getExerciseRecommendation(anxietyLevel, fatigueLevel) {
  if (anxietyLevel >= 4) return '478';
  if (anxietyLevel >= 3 && fatigueLevel >= 3) return 'diaphragmatic';
  return 'square';
}
