import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificação não concedida');
    return false;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
}

export async function scheduleSleepReminder(hour, minute) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Noite Serena',
        body: 'Hora de relaxar e preparar a mente para um sono tranquilo.',
        sound: 'default',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    return true;
  } catch (error) {
    console.error('Erro ao agendar lembrete noturno:', error);
    return false;
  }
}

export async function scheduleMorningReminder(hour, minute) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Noite Serena',
        body: 'Como foi sua noite de sono? Registre no seu diário matinal.',
        sound: 'default',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    return true;
  } catch (error) {
    console.error('Erro ao agendar lembrete matinal:', error);
    return false;
  }
}

// src/context/AppContext.js
// Contexto global de estado: usuário, último check-in e recomendação do dia

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymousUser } from '../services/firebase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [todayRecommendation, setTodayRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        const storedCheckin = await AsyncStorage.getItem('@noite_serena:lastCheckin');
        const storedRecommendation = await AsyncStorage.getItem('@noite_serena:todayRecommendation');
        if (storedCheckin) setLastCheckin(JSON.parse(storedCheckin));
        if (storedRecommendation) setTodayRecommendation(JSON.parse(storedRecommendation));

        const currentUser = await signInAnonymousUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  async function setCheckin(checkin) {
    try {
      await AsyncStorage.setItem('@noite_serena:lastCheckin', JSON.stringify(checkin));
      setLastCheckin(checkin);
    } catch (error) {
      console.error('Erro ao salvar checkin local:', error);
    }
  }

  async function setRecommendation(recommendation) {
    try {
      await AsyncStorage.setItem('@noite_serena:todayRecommendation', JSON.stringify(recommendation));
      setTodayRecommendation(recommendation);
    } catch (error) {
      console.error('Erro ao salvar recomendação local:', error);
    }
  }

  async function clearSession() {
    try {
      await AsyncStorage.multiRemove([
        '@noite_serena:lastCheckin',
        '@noite_serena:todayRecommendation',
      ]);
      setLastCheckin(null);
      setTodayRecommendation(null);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        lastCheckin,
        todayRecommendation,
        isLoading,
        setCheckin,
        setRecommendation,
        clearSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppContext;

