import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import CheckinScreen from '../screens/CheckinScreen';
import ExercisePlayerScreen from '../screens/ExercisePlayerScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SleepDiaryScreen from '../screens/SleepDiaryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Checkin" component={CheckinScreen} />
      <HomeStack.Screen name="ExercisePlayer" component={ExercisePlayerScreen} />
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#533483',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#e8e8e8',
    border: '#0f3460',
    notification: '#e94560',
  },
};

const tabBarStyle = {
  backgroundColor: '#16213e',
  borderTopColor: '#0f3460',
  borderTopWidth: 1,
};

const tabIconStyle = {
  fontSize: 22,
  lineHeight: 26,
};

function AppNavigator() {
  return (
    <NavigationContainer theme={darkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#e94560',
          tabBarInactiveTintColor: '#a0a0b0',
          tabBarStyle,
        }}
      >
        <Tab.Screen
          name="Início"
          component={HomeStackNavigator}
          options={({ route }) => ({
            tabBarIcon: () => <Text style={tabIconStyle}>🏠</Text>,
            tabBarStyle: {
              ...tabBarStyle,
              display: getFocusedRouteNameFromRoute(route) === 'ExercisePlayer'
                ? 'none'
                : 'flex',
            },
          })}
        />
        <Tab.Screen
          name="Exercícios"
          component={LibraryScreen}
          options={{
            tabBarIcon: () => <Text style={tabIconStyle}>📖</Text>,
          }}
        />
        <Tab.Screen
          name="Diário"
          component={SleepDiaryScreen}
          options={{
            tabBarIcon: () => <Text style={tabIconStyle}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="Ajustes"
          component={SettingsScreen}
          options={{
            tabBarIcon: () => <Text style={tabIconStyle}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
