import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

interface QuickStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface FeaturedTutor {
  id: string;
  name: string;
  subject: string;
  rating: number;
  image: string;
  price: number;
}

const HomeScreen = ({ navigation }: any) => {
  const [userRole, setUserRole] = useState<'student' | 'tutor' | 'both'>('student');
  const currentUser = auth().currentUser;

  useEffect(() => {
    console.log('📱 HomeScreen mounted/focused');
    // In real app, fetch user role from Firestore
    setUserRole('both'); // Mock: user can be both student and tutor
    
    return () => {
      console.log('📱 HomeScreen unmounted/unfocused');
    };
  }, []);

  const handleSignOut = () => {
    console.log('🚪 Signing out from HomeScreen...');
    auth().signOut();
  };

  const quickStats: QuickStat[] = [
    { title: 'Available Tutors', value: '25+', icon: 'people', color: 'bg-blue-500' },
    { title: 'Subjects', value: '15', icon: 'library', color: 'bg-green-500' },
    { title: 'Sessions Today', value: '8', icon: 'calendar', color: 'bg-purple-500' },
    { title: 'Average Rating', value: '4.8', icon: 'star', color: 'bg-yellow-500' },
  ];

  const featuredTutors: FeaturedTutor[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      price: 25,
    },
    {
      id: '2',
      name: 'Michael Chen',
      subject: 'Programming',
      rating: 4.8,
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      price: 35,
    },
    {
      id: '3',
      name: 'Dr. Emma Wilson',
      subject: 'Biology',
      rating: 4.7,
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      price: 40,
    },
  ];

  const renderQuickStat = ({ item }: { item: QuickStat }) => (
    <View className="bg-white rounded-xl p-4 mr-4 shadow-sm min-w-[120px]">
      <View className={`${item.color} w-12 h-12 rounded-full items-center justify-center mb-3`}>
        <Icon name={item.icon as any} size={24} color="white" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-1">{item.value}</Text>
      <Text className="text-sm text-gray-600">{item.title}</Text>
    </View>
  );

  const renderFeaturedTutor = ({ item }: { item: FeaturedTutor }) => (
    <View className="bg-white rounded-xl p-4 mr-4 shadow-sm w-48">
      <Image source={{ uri: item.image }} className="w-16 h-16 rounded-full mb-3" />
      <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
      <Text className="text-teal-600 font-semibold mb-2">{item.subject}</Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Icon name="star" size={16} color="#FFD700" />
          <Text className="ml-1 text-gray-600">{item.rating}</Text>
        </View>
        <Text className="text-gray-800 font-semibold">${item.price}/hr</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Welcome Header */}
      <View className="bg-teal-600 px-6 py-8 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">
              {currentUser?.displayName || 'Student'}!
            </Text>
            <Text className="text-teal-100 mt-2">
              Ready to learn something new today?
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full"
            onPress={handleSignOut}
          >
            <Icon name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="mt-6 mb-4">
        <Text className="text-xl font-bold text-gray-800 mx-6 mb-4">
          Platform Overview
        </Text>
        <FlatList
          data={quickStats}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderQuickStat}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      {/* Role-based Actions */}
      <View className="mx-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
        
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm flex-1 mr-2 mb-3"
            onPress={() => navigation.navigate('TutorList')}
          >
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
              <Icon name="search" size={24} color="#3b82f6" />
            </View>
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              Find Tutors
            </Text>
            <Text className="text-gray-600 text-sm">
              Browse and book sessions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2 mb-3"
            onPress={() => navigation.navigate('MyBookings')}
          >
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
              <Icon name="calendar" size={24} color="#10b981" />
            </View>
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              My Bookings
            </Text>
            <Text className="text-gray-600 text-sm">
              View scheduled sessions
            </Text>
          </TouchableOpacity>
        </View>

        {(userRole === 'tutor' || userRole === 'both') && (
          <TouchableOpacity
            className="bg-teal-600 rounded-xl p-4 shadow-sm mt-2"
            onPress={() => navigation.navigate('BecomeATutor')}
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Icon name="person-add" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-white mb-1">
                  Tutor Dashboard
                </Text>
                <Text className="text-teal-100 text-sm">
                  Manage your teaching schedule
                </Text>
              </View>
              <Icon name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Featured Tutors */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mx-6 mb-4">
          <Text className="text-xl font-bold text-gray-800">Top Tutors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TutorList')}>
            <Text className="text-teal-600 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredTutors}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderFeaturedTutor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      {/* Recent Activity */}
      <View className="mx-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Recent Activity</Text>
        
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Icon name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">
                Session completed with Michael Chen
              </Text>
              <Text className="text-gray-600 text-sm">Programming • 2 hours ago</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Icon name="calendar" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">
                Upcoming session with Sarah Johnson
              </Text>
              <Text className="text-gray-600 text-sm">Mathematics • Tomorrow 9:00 AM</Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="border border-teal-600 rounded-lg py-3 mt-2"
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Text className="text-teal-600 text-center font-semibold">
              View All Activity
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default HomeScreen;