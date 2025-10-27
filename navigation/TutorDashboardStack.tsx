import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TutorDashboardHome from '../screens/TutorDashboardHome.tsx';
import AvailabilityScreen from '../screens/tutor-onboarding/AvailabilityScreen.tsx';
import ReviewProfileScreen from '../screens/tutor-onboarding/ReviewProfileScreen.tsx';
import ContactInfoScreen from '../screens/tutor-onboarding/ContactInfoScreen.tsx';
import ManageBookingsScreen from '../screens/tutor-onboarding/ManageBookingsScreen.tsx';

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
        name="AvailabilityScreen" 
        component={AvailabilityScreen}
        options={{ title: 'Set Availability' }}
      />
      <Stack.Screen 
        name="ReviewProfileScreen" 
        component={ReviewProfileScreen}
        options={{ title: 'Review Profile' }}
      />
      <Stack.Screen 
        name="ContactInfoScreen" 
        component={ContactInfoScreen}
        options={{ title: 'Contact Information' }}
      />
      <Stack.Screen 
        name="ManageBookingsScreen" 
        component={ManageBookingsScreen}
        options={{ title: 'Manage Bookings' }}
      />
    </Stack.Navigator>
  );
}