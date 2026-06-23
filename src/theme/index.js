export const theme = {
  colors: {
    background: '#1a1a2e',
    surface: '#16213e',
    primary: '#0f3460',
    accent: '#533483',
    emergency: '#e94560',
    text: '#e8e8e8',
    textSecondary: '#a0a0b0',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#f87171',
    overlay: 'rgba(0,0,0,0.6)',
    gradientStart: '#1a1a2e',
    gradientEnd: '#16213e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    caption: 12,
    body: 16,
    subtitle: 18,
    title: 24,
    heading: 32,
    fontFamily: 'System',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6.27,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12.11,
      elevation: 10,
    },
  },
};

export default theme;
