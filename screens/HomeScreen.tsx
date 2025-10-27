import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { Tutor, Profile, QuickStat } from '../types';

const HomeScreen = ({ navigation }: any) => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    {
      title: 'Available Tutors',
      value: 0,
      icon: 'people',
      color: 'bg-blue-500',
    },
    {
      title: 'Subjects',
      value: 0,
      icon: 'library',
      color: 'bg-green-500',
    },
    {
      title: 'Average Rating',
      value: 0,
      icon: 'star',
      color: 'bg-yellow-500',
    },
  ]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .where('profile', '!=', null)
      .onSnapshot(snapshot => {
        const data: Tutor[] = snapshot.docs
          .map(doc => {
            const docData = doc.data() as Partial<Tutor>;
        
            const profile: Profile = {
              bio: (docData?.profile as Profile)?.bio ?? '',
              speciality: (docData?.profile as Profile)?.speciality ?? '',
              rating: (docData?.profile as Profile)?.rating ?? 0,
              totalReviews: (docData?.profile as Profile)?.totalReviews ?? 0,
            };

            return {
              id: doc.id,
              name: docData?.name ?? 'Unknown',
              profile,
              createdAt: (docData as any)?.createdAt,
              updatedAt: (docData as any)?.updatedAt,
            } as Tutor;
          });
        setTutors(data);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .where("profile", "!=", null)
      .onSnapshot(snapshot =>
        setQuickStats(previous => {
          const updated = [...previous];
          const subjectsSet = new Set();

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            updated[0].value = snapshot.size;

            const speciality = data?.profile?.speciality || '';
            subjectsSet.add(speciality);
            updated[1].value = subjectsSet.size;

            const totalRating = snapshot.docs.reduce((sum, d) => {
              const rating = d.data()?.profile?.rating || 0;
              return sum + rating;
            }, 0);
            updated[2].value =
              snapshot.size > 0
                ? parseFloat((totalRating / snapshot.size).toFixed(1))
                : 0;
          });
          return updated;
        }),
      );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = () => {
    auth().signOut();
  };

  const renderQuickStat = ({ item }: { item: QuickStat }) => (
    <View className="bg-white rounded-xl p-4 mr-4 shadow-sm min-w-[120px]">
      <View
        className={`${item.color} w-12 h-12 rounded-full items-center justify-center mb-3`}
      >
        <Icon name={item.icon as any} size={24} color="white" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-1">
        {item.value}
      </Text>
      <Text className="text-sm text-gray-600">{item.title}</Text>
    </View>
  );

  const renderFeaturedTutor = ({ item }: { item: Tutor }) => (
    <View className="bg-white rounded-xl p-4 mr-4 shadow-sm w-48">
      <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
      <View className="flex-row flex-wrap my-2">
        {item.profile?.speciality && (
          <View className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-2">
            <Text className="text-teal-800 text-sm font-medium">
              {item.profile.speciality}
            </Text>
          </View>
        )}
        {!item.profile?.speciality && (
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-sm">No speciality yet</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Icon name="star" size={16} color="#FFD700" />
          <Text className="ml-1 text-gray-600">
            {item.profile?.rating || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-teal-600 px-6 py-8 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg">Welcome</Text>
            <Text className="text-white text-2xl font-bold">
              {currentUser?.displayName || 'Student'}!
            </Text>
            <Text className="text-teal-100 mt-2">
              Ready to learn something new today?
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full"
            onPress={() => setLogoutModal(true)}
          >
            <Icon name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-6 mb-4">
        <Text className="text-xl font-bold text-gray-800 mx-6 mb-4">
          Platform Overview
        </Text>
        <FlatList
          data={quickStats}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderQuickStat}
          keyExtractor={item => item.title}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      <View className="mx-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Quick Actions
        </Text>

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

        <TouchableOpacity
          className="bg-teal-600 rounded-xl p-4 shadow-sm mt-2"
          onPress={() => navigation.navigate('TutorDashboard')}
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
      </View>

      <View className="mb-6">
        <View className="flex-row items-center justify-between mx-6 mb-4">
          <Text className="text-xl font-bold text-gray-800">Top Tutors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TutorList')}>
            <Text className="text-teal-600 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tutors}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderFeaturedTutor}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <View className='flex-1 items-center justify-center bg-black/50'>
          <View className='bg-white p-4 w-full max-w-sm rounded-lg'>
            <Text className='text-lg font-bold text-center text-gray-800 mb-4'>
              Confirm Logout
              </Text>
              <Text className='text-center'>
                Are you sure you want to log out?
              </Text>

              <View className='flex-row mt-4'>
                <TouchableOpacity className='bg-teal-600 px-6 py-3 flex-1 rounded-xl mr-2' onPress={() => setLogoutModal(false)}>
                  <Text className='font-semibold text-center text-white'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSignOut} className='bg-red-600 px-6 py-3 flex-1 rounded-xl ml-2'>
                  <Text className='text-center text-white font-semibold'>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;