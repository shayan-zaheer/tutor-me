import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const TutorDashboardHome = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = auth().currentUser;

  useEffect(() => {
    loadTutorSetupStatus();
  }, []);

  const loadTutorSetupStatus = async () => {
    try {
      const userId = currentUser?.uid;
      if (!userId) return;

      // Load setup status from AsyncStorage (in real app, use Firestore)
      const statusData = await AsyncStorage.getItem(`tutor-setup-${userId}`);
      if (statusData) {
        const status = JSON.parse(statusData);
      }
    } catch (error) {
      console.error('Error loading tutor setup status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      screen: "TutorBookingsScreen",
      color: "bg-yellow-500",
    }
  ];

  const handleStepPress = (step: any) => {
    navigation.navigate(step.screen);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
        <View className="mx-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Complete Your Setup
          </Text>
          <Text className="text-gray-600 mb-4">
            Complete these one-time setup steps to start tutoring:
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

      <View className="mx-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Your Statistics
        </Text>
        
        <View className="flex-row flex-wrap">
          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mr-2 mb-3">
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
              <Icon name="people" size={24} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              
            </Text>
            <Text className="text-gray-600">Students</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2 mb-3">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
              <Icon name="star" size={24} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">

            </Text>
            <Text className="text-gray-600">Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TutorDashboardHome;