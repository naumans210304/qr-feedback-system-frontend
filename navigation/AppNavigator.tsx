import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../app/HomeScreen';
import FeedbackScreen from '../app/FeedbackScreen';
import PerformanceScreen from '../app/PerformanceScreen';
import LoginScreen from '../app/LoginScreen';
import ManagerDashboard from '../app/ManagerDashboard';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<'LoginScreen' | 'HomeScreen'>('LoginScreen');
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('role');

        if (token && userRole) {
          console.log(`User is logged in as: ${userRole}`);
          setRole(userRole);
          setInitialRoute('HomeScreen');
        } else {
          console.warn("⚠️ No token found, setting initial route to LoginScreen");
          setInitialRoute('LoginScreen');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null; 

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="PerformanceScreen" component={PerformanceScreen} />
      
      {/* Only allow managers to access the Manager Dashboard */}
      {role === 'manager' && <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />}
    </Stack.Navigator>
  );
};

export default AppNavigator;