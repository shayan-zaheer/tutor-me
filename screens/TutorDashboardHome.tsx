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

interface TutorSetupStatus {
  hasAvailability: boolean;
  hasProfileReview: boolean;
  hasContactInfo: boolean;
  isComplete: boolean;
}

const TutorDashboardHome = ({ navigation }: any) => {
  const [setupStatus, setSetupStatus] = useState<TutorSetupStatus>({
    hasAvailability: false,
    hasProfileReview: false,
    hasContactInfo: false,
    isComplete: false,
  });
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
        setSetupStatus(status);
      }
    } catch (error) {
      console.error('Error loading tutor setup status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetupStatus = async (key: keyof TutorSetupStatus, value: boolean) => {
    try {
      const userId = currentUser?.uid;
      if (!userId) return;

      const newStatus = { ...setupStatus, [key]: value };
      newStatus.isComplete = newStatus.hasAvailability && newStatus.hasProfileReview && newStatus.hasContactInfo;
      
      setSetupStatus(newStatus);
      await AsyncStorage.setItem(`tutor-setup-${userId}`, JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error updating setup status:', error);
    }
  };

  const setupSteps = [
    {
      id: 'availability',
      title: 'Set Your Availability',
      description: 'Configure your weekly teaching schedule',
      icon: 'time-outline',
      completed: setupStatus.hasAvailability,
      screen: 'AvailabilityScreenme',
      color: 'bg-blue-500',
    },
    {
      id: 'profile',
      title: 'Complete Profile Review',
      description: 'Review and update your teaching profile',
      icon: 'person-outline',
      completed: setupStatus.hasProfileReview,
      screen: 'ReviewProfileScreenme',
      color: 'bg-green-500',
    },
    {
      id: 'contact',
      title: 'Add Contact Information',  
      description: 'Set up how students can reach you',
      icon: 'mail-outline',
      completed: setupStatus.hasContactInfo,
      screen: 'ContactInfoScreenme',
      color: 'bg-purple-500',
    },
  ];

  const handleStepPress = (step: any) => {
    navigation.navigate(step.screen, {
      onComplete: () => updateSetupStatus(step.id as keyof TutorSetupStatus, true),
    });
  };

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const totalSteps = setupSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Welcome Header */}
      <View className="bg-teal-600 px-6 py-8 rounded-b-3xl">
        <Text className="text-white text-lg">Welcome to your</Text>
        <Text className="text-white text-2xl font-bold mb-2">Tutor Dashboard</Text>
        <Text className="text-teal-100">
          {setupStatus.isComplete 
            ? 'Your tutor profile is complete! 🎉'
            : `Complete your setup: ${completedSteps}/${totalSteps} steps done`
          }
        </Text>
        
        {/* Progress Bar */}
        <View className="bg-white/20 rounded-full h-2 mt-4">
          <View 
            className="bg-white rounded-full h-2"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {/* Setup Status */}
      {!setupStatus.isComplete && (
        <View className="mx-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Complete Your Setup
          </Text>
          <Text className="text-gray-600 mb-4">
            Complete these one-time setup steps to start tutoring:
          </Text>
        </View>
      )}

      {/* Setup Steps */}
      <View className="mx-6 mb-6">
        {setupSteps.map((step) => (
          <TouchableOpacity
            key={step.id}
            className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${
              step.completed ? 'border-green-500' : 'border-gray-300'
            }`}
            onPress={() => handleStepPress(step)}
          >
            <View className="flex-row items-center">
              <View className={`${step.color} w-12 h-12 rounded-full items-center justify-center mr-4`}>
                <Icon 
                  name={step.completed ? 'checkmark-circle' : step.icon} 
                  size={24} 
                  color="white" 
                />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-gray-800">
                    {step.title}
                  </Text>
                  {step.completed && (
                    <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                      <Text className="text-green-600 text-xs font-semibold">DONE</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 mt-1">{step.description}</Text>
              </View>
              
              <Icon 
                name="chevron-forward" 
                size={20} 
                color={step.completed ? "#10b981" : "#6b7280"} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dashboard Actions */}
      {setupStatus.isComplete && (
        <View className="mx-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Dashboard Actions
          </Text>
          
          <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  View Your Profile
                </Text>
                <Text className="text-gray-600">
                  See how students view your profile
                </Text>
              </View>
              <TouchableOpacity className="bg-teal-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">View</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Manage Sessions
                </Text>
                <Text className="text-gray-600">
                  View upcoming and past sessions
                </Text>
              </View>
              <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Quick Stats */}
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
              {setupStatus.isComplete ? '12' : '0'}
            </Text>
            <Text className="text-gray-600">Students</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2 mb-3">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
              <Icon name="star" size={24} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {setupStatus.isComplete ? '4.8' : 'N/A'}
            </Text>
            <Text className="text-gray-600">Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TutorDashboardHome;