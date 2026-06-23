import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppProvider, useAppContext } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestNotificationPermissions } from './src/services/notifications';
import { theme } from './src/theme';

function AppContent() {
  const { isLoading } = useAppContext();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Preparando sua noite serena...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
  },
});
