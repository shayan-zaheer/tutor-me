import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TutorDashboardHome from '../screens/TutorDashboardHome.tsx';
import AvailabilityScreenme from '../screens/AvailabilityScreenme';
import ReviewProfileScreenme from '../screens/ReviewProfileScreenme';
import ContactInfoScreenme from '../screens/ContactInfoScreenme';

const Stack = createNativeStackNavigator();

export default function TutorDashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#008080' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="TutorDashboardHome" 
        component={TutorDashboardHome}
        options={{ title: 'Tutor Dashboard' }}
      />
      <Stack.Screen 
        name="AvailabilityScreenme" 
        component={AvailabilityScreenme}
        options={{ title: 'Set Availability' }}
      />
      <Stack.Screen 
        name="ReviewProfileScreenme" 
        component={ReviewProfileScreenme}
        options={{ title: 'Review Profile' }}
      />
      <Stack.Screen 
        name="ContactInfoScreenme" 
        component={ContactInfoScreenme}
        options={{ title: 'Contact Information' }}
      />
    </Stack.Navigator>
  );
}