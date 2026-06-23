export const sleepQuotes = [
  'Cada noite é uma nova oportunidade de descansar a mente.',
  'Respire fundo. Você está seguro. O sono virá naturalmente.',
  'A ansiedade é uma visita passageira; a calma é sua morada.',
  'Permita-se soltar o que não pode controlar até amanhã.',
  'Seu corpo sabe dormir. Confie nele.',
  'A noite pede apenas que você descanse.',
];

export function getRecommendation(anxietyLevel, fatigueLevel) {
  if (anxietyLevel >= 4) return '478';
  if (anxietyLevel >= 3 && fatigueLevel >= 3) return 'diaphragmatic';
  return 'square';
}

export function formatHours(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (m === 60) return `${h + 1}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function getQualityLabel(score) {
  const labels = {
    1: 'Muito ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Boa',
    5: 'Excelente',
  };
  return labels[score] || 'Não avaliada';
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function pickRandomQuote() {
  return sleepQuotes[Math.floor(Math.random() * sleepQuotes.length)];
}

export function getDayLabel(date, short = true) {
  const days = short
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[date.getDay()];
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

