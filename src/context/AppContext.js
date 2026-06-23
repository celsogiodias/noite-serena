import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymousUser } from '../services/firebase';
import theme from '../theme';

const AppContext = createContext(undefined);

const STORAGE_KEYS = {
  lastCheckin: '@noite_serena:lastCheckin',
  todayRecommendation: '@noite_serena:todayRecommendation',
  user: '@noite_serena:user',
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lastCheckin, setLastCheckinState] = useState(null);
  const [todayRecommendation, setTodayRecommendationState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedLastCheckin, storedRecommendation] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.lastCheckin),
        AsyncStorage.getItem(STORAGE_KEYS.todayRecommendation),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedLastCheckin) {
        setLastCheckinState(JSON.parse(storedLastCheckin));
      }
      if (storedRecommendation) {
        setTodayRecommendationState(JSON.parse(storedRecommendation));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do AsyncStorage:', error);
    }
  };

  const signInUser = async () => {
    try {
      const signedUser = await signInAnonymousUser();
      if (signedUser) {
        setUser(signedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(signedUser));
      }
    } catch (error) {
      console.error('Erro ao autenticar usuário anônimo:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await loadStoredData();
        await signInUser();
      } catch (error) {
        console.error('Erro ao inicializar AppContext:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const setCheckin = async (data) => {
    try {
      setLastCheckinState(data);
      await AsyncStorage.setItem(STORAGE_KEYS.lastCheckin, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
    }
  };

  const setRecommendation = async (recommendation) => {
    try {
      setTodayRecommendationState(recommendation);
      await AsyncStorage.setItem(STORAGE_KEYS.todayRecommendation, JSON.stringify(recommendation));
    } catch (error) {
      console.error('Erro ao salvar recomendação:', error);
    }
  };

  const clearSession = async () => {
    try {
      setUser(null);
      setLastCheckinState(null);
      setTodayRecommendationState(null);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.user,
        STORAGE_KEYS.lastCheckin,
        STORAGE_KEYS.todayRecommendation,
      ]);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  };

  const value = {
    user,
    lastCheckin,
    todayRecommendation,
    isLoading,
    setCheckin,
    setRecommendation,
    clearSession,
    theme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};

export default AppProvider;
