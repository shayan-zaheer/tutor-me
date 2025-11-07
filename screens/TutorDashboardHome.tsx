import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PageContainer } from '../components/PageContainer';

const TutorDashboardHome = ({ navigation }: any) => {
  const setupSteps = [
    {
      id: 'availability',
      title: 'Set Your Availability',
      description: 'Configure your weekly teaching schedule',
      icon: 'time-outline',
      screen: 'AvailabilityScreen',
      color: 'bg-blue-500',
    },
    {
      id: 'profile',
      title: 'Complete Profile Review',
      description: 'Review and update your teaching profile',
      icon: 'person-outline',
      screen: 'ReviewProfileScreen',
      color: 'bg-green-500',
    },
    {
      id: 'contact',
      title: 'Add Contact Information',  
      description: 'Set up how students can reach you',
      icon: 'mail-outline',
      screen: 'ContactInfoScreen',
      color: 'bg-purple-500',
    },
    {
      id: "bookings",
      title: "Manage Bookings",
      description: "View and manage your tutoring sessions",
      icon: "book-outline",
      screen: "ManageBookingsScreen",
      color: "bg-yellow-500",
    }
  ];

  const handleStepPress = (step: any) => {
    navigation.navigate(step.screen);
  };

  return (
    <PageContainer 
      enableKeyboardAvoiding={false}
      backgroundColor="#f9fafb"
    >
        <View className="mx-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Manage Your Setup
          </Text>
          <Text className="text-gray-600 mb-4">
            Manage your tutoring profile and schedule here:
          </Text>
        </View>

      <View className="mx-6 mb-6">
        {setupSteps.map((step) => (
          <TouchableOpacity
            key={step.id}
            className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${
              'border-gray-300'
            }`}
            onPress={() => handleStepPress(step)}
          >
            <View className="flex-row items-center">
              <View className={`${step.color} w-12 h-12 rounded-full items-center justify-center mr-4`}>
                <Icon 
                  name={step.icon} 
                  size={24} 
                  color="white" 
                />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-gray-800">
                    {step.title}
                  </Text>
                </View>
                <Text className="text-gray-600 mt-1">{step.description}</Text>
              </View>
              
              <Icon 
                name="chevron-forward" 
                size={20} 
                color={"#6b7280"} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </PageContainer>
  );
};

export default TutorDashboardHome;