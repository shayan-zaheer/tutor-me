import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, Text, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/auth/LoginScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import Tabs from './navigation/Tabs';
import { useState, useEffect, useRef, useCallback } from 'react';

enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef(null);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const onAuthStateChanged = useCallback(
    (authUser: FirebaseAuthTypes.User | null) => {
      setUser(authUser);
      if (initializing) {
        setInitializing(false);
      }
    },
    [initializing],
  );

  useEffect(() => {
    try {
      const authInstance = auth();
      const subscriber = authInstance.onAuthStateChanged(onAuthStateChanged);

      const timeout = setTimeout(() => {
        if (initializing) {
          setInitializing(false);
        }
      }, 3000);

      return () => {
        subscriber();
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setInitializing(false);
    }
  }, [onAuthStateChanged, initializing]);

  const onNavigationStateChange = (state: any) => {
    const currentRouteName = state?.routes[state.index]?.name;
    console.log('Current Screen:', currentRouteName);
    console.log(
      'User Status:',
      user ? `Logged in (${user.email})` : 'Not logged in',
    );
    console.log('Auth State:', { user: !!user, initializing });
  };

  if (initializing) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center bg-blue-50">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="mt-3 text-lg text-[#008080] font-semibold">
            Loading...
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            Checking authentication
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}
      >
        {user ? (
          <Tabs />
        ) : (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: true,
                title: 'TutorMe Login',
                headerStyle: { backgroundColor: '#008080' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}