import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { populateReferences } from '../../utils/populateReferences';

const ManageBookingsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>(
    'upcoming',
  );
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    setIsLoading(true);
    const tutorRef = firestore().collection('users').doc(currentUser.uid);
    const unsubscribe = firestore()
      .collection('bookings')
      .where('tutor', '==', tutorRef)
      .onSnapshot(async snapshot => {
        try {
          const books = await Promise.all(
            snapshot.docs.map(async doc => {
              const populated = await populateReferences(doc.data());
              return { id: doc.id, ...populated };
            }),
          );

          const currentDate = new Date();
          const upcoming: any = [];
          const past: any = [];

          books.forEach(booking => {
            const bookingDate = booking.bookedSlot.startTime.toDate();
            if (bookingDate >= currentDate) {
              upcoming.push(booking);
            } else {
              past.push(booking);
            }
          });

          setUpcomingBookings(upcoming);
          setPastBookings(past);
        } catch (error) {
          console.error('Error populating bookings:', error);
        } finally {
          setIsLoading(false);
        }
      });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const renderBookingItem = ({ item: booking }: { item: any }) => (
    <View className="bg-white mx-2 mb-4 rounded-xl shadow-lg">
      <View className="p-6">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {booking.student?.name ?? 'Unknown Student'}
            </Text>

            <View className="flex-row items-center mb-1">
              <Icon name="calendar-outline" size={16} color="#666" />
              <Text className="ml-2 text-gray-700">
                {booking.bookedSlot.startTime
                  .toDate()
                  .toLocaleDateString('en-GB')}{' '}
                |{' '}
                {booking.bookedSlot.startTime
                  .toDate()
                  .toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                -{' '}
                {booking.bookedSlot.endTime
                  .toDate()
                  .toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                | {'$' + booking.bookedSlot.price}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Icon name="card-outline" size={16} color="#666" />
              <Text className="ml-2 text-gray-700 font-semibold">
                {booking.isPaid ? 'Paid' : 'Not Paid'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 gap-y-2">
      <View className="border border-gray-300 bg-[#F7F8FC] rounded-full flex-row justify-between items-center p-1 mb-3">
        <TouchableOpacity
          className={`flex-1 p-2 rounded-full ${
            selectedTab === 'upcoming' ? 'bg-teal-700' : ''
          }`}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'upcoming' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-2 rounded-full ${
            selectedTab === 'past' ? 'bg-teal-700' : ''
          }`}
          onPress={() => setSelectedTab('past')}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'past' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

       {isLoading && ((selectedTab === "past" && pastBookings.length === 0) || (selectedTab === "upcoming" && upcomingBookings.length === 0)) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={50} />
        </View>
      ) : !isLoading && ((selectedTab === "past" && pastBookings.length === 0) || (selectedTab === "upcoming" && upcomingBookings.length === 0)) ? (
        <View className="flex-1 items-center justify-center">
          <Icon name="calendar-outline" size={60} color="#ccc" />
          <Text className="text-gray-500 text-lg font-medium mt-4">
            No {selectedTab} bookings
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center px-8">
            {selectedTab === 'upcoming' 
              ? 'You have no upcoming sessions scheduled'
              : 'You have no past sessions to display'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal={false}
          data={selectedTab === 'upcoming' ? upcomingBookings : pastBookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          className="pb-5"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ManageBookingsScreen;