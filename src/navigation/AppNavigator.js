import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import CheckinScreen from '../screens/CheckinScreen';
import ExercisePlayerScreen from '../screens/ExercisePlayerScreen';
import SleepDiaryScreen from '../screens/SleepDiaryScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Checkin" component={CheckinScreen} />
      <HomeStack.Screen
        name="ExercisePlayer"
        component={ExercisePlayerScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />
    </HomeStack.Navigator>
  );
}

function TabIcon({ focused, label, icon }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            const icons = {
              Início: { icon: '🏠', label: 'Início' },
              Exercícios: { icon: '📖', label: 'Exercícios' },
              Diário: { icon: '📊', label: 'Diário' },
              Ajustes: { icon: '⚙️', label: 'Ajustes' },
            };
            const item = icons[route.name];
            return <TabIcon focused={focused} label={item.label} icon={item.icon} />;
          },
        })}
      >
        <Tab.Screen name="Início" component={HomeStackNavigator} />
        <Tab.Screen name="Exercícios" component={LibraryScreen} />
        <Tab.Screen name="Diário" component={SleepDiaryScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.primary,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  labelFocused: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});

