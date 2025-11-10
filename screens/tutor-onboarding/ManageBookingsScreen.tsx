import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import { PageContainer } from '../../components/PageContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  formatBookingCardDisplay, 
  timestampToMillis,
  sortBookingsByDate,
  getCurrentDate,
  isWithinTimeThreshold
} from '../../utils/dateUtil';
import { bookingService } from '../../services/bookingService';
import { GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useTabGesture } from '../../hooks/useTabGesture';

const ManageBookingsScreen = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTimeWarningModal, setShowTimeWarningModal] = useState(false);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUser = auth().currentUser;

  const { selectedTab, switchToTab, animatedStyle, panGesture, SCREEN_WIDTH } = useTabGesture();

  const checkIfCanDelete = (booking: any) => {
    if (isWithinTimeThreshold(booking.bookedSlot.startTime, 15)) {
      setSelectedBooking(booking);
      setShowTimeWarningModal(true);
      return false;
    }
    
    setSelectedBooking(booking);
    setShowDeleteModal(true);
    return true;
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setUpcomingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      Alert.alert('Success', 'Booking deleted successfully');
      setShowDeleteModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking');
    }
  };

  const markBookingComplete = async (bookingId: string) => {
    try {
      await bookingService.markBookingComplete(bookingId);
      Alert.alert('Success', 'Booking marked as completed');
      setShowMarkCompleteModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error marking booking complete:', error);
      Alert.alert('Error', 'Failed to mark booking as completed');
    }
  };

  const loadBookings = useCallback(() => {
    if (!currentUser?.uid) return;

    setIsLoading(true);

    bookingService.getTutorBookings(currentUser.uid)
      .then((books: any) => {
        const upcoming: any = [];
        const completed: any = [];

        books.forEach((booking: any) => {
          const status = booking.status || 'booked';
          
          if (status === 'completed') {
            completed.push(booking);
          } else {
            upcoming.push(booking);
          }
        });

        setUpcomingBookings(sortBookingsByDate(upcoming));
        setCompletedBookings(sortBookingsByDate(completed));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading tutor bookings:', error);
        setIsLoading(false);
      });
  }, [currentUser?.uid]);

  useEffect(() => {
    loadBookings();
  }, [currentUser?.uid, loadBookings]);

  const renderBookingItem = ({ item: booking }: { item: any }) => {
    const bookingStart = timestampToMillis(booking.bookedSlot.startTime);
    const bookingEnd = timestampToMillis(booking.bookedSlot.endTime);
    const currentTime = getCurrentDate().getTime();
    const isFutureBooking = currentTime < bookingStart;
    const isPastBooking = currentTime > bookingEnd;
    const needsCompletion = isPastBooking && (!booking.status || booking.status === 'booked');

    return (
      <View className="bg-white mx-2 mb-4 rounded-xl shadow-lg">
        <View className="p-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-xl font-bold text-gray-800">
                  {booking.student?.name ?? 'Unknown Student'}
                </Text>
              </View>

              <View className="flex-row items-center mb-1">
                <Icon name="calendar-outline" size={16} color="#666" />
                <Text className="ml-2 text-gray-700">
                  {formatBookingCardDisplay(booking.bookedSlot.startTime, booking.bookedSlot.endTime)} | {'$' + booking.bookedSlot.price}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Icon name="card-outline" size={16} color="#666" />
                <Text className="ml-2 text-gray-700 font-semibold">
                  {booking.isPaid ? 'Paid' : 'Not Paid'}
                </Text>
              </View>

              {needsCompletion && (
                <TouchableOpacity 
                  className="bg-green-500 rounded-lg px-4 py-2 self-start mb-2"
                  onPress={() => {setSelectedBooking(booking); setShowMarkCompleteModal(true);}}
                >
                  <Text className="text-white font-semibold text-sm">Mark as Complete</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="flex-col items-end">
              {isFutureBooking && (
                <TouchableOpacity onPress={() => checkIfCanDelete(booking)}>
                  <Icon name="trash" size={22} color="#008080" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = (tab: 'upcoming' | 'completed') => {
    const bookings = tab === 'upcoming' ? upcomingBookings : completedBookings;
    const isLoadingTab = isLoading && bookings.length === 0;
    const isEmpty = !isLoading && bookings.length === 0;

    if (isLoadingTab) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={50} />
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View className="flex-1 items-center justify-center">
          <Icon name="calendar-outline" size={60} color="#ccc" />
          <Text className="text-gray-500 text-lg font-medium mt-4">
            No {tab} bookings
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center px-8">
            {tab === 'upcoming'
              ? 'You have no upcoming sessions scheduled'
              : 'You have no completed sessions'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal={false}
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        className="pb-5"
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadBookings}
      />
    );
  };

  return (
    <PageContainer 
      enableKeyboardAvoiding={false}
    >
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 pt-4 gap-y-2">
        <View className="mx-4 border border-gray-300 bg-[#F7F8FC] rounded-full flex-row justify-between items-center p-1 mb-3">
          <TouchableOpacity
            className={`flex-1 p-2 rounded-full ${
              selectedTab === 'upcoming' ? 'bg-teal-700' : ''
            }`}
            onPress={() => switchToTab('upcoming')}
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
              selectedTab === 'completed' ? 'bg-teal-700' : ''
            }`}
            onPress={() => switchToTab('completed')}
          >
            <Text
              className={`text-center font-semibold ${
                selectedTab === 'completed' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showDeleteModal} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View className="bg-white rounded-xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-center mb-4">
                Delete Booking
              </Text>
              <Text className="text-center text-gray-700 mb-4">
                Are you sure you want to delete this booking?
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text className="text-center font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-500 px-6 py-3 rounded-lg flex-1 ml-2"
                  onPress={() =>
                    deleteBooking(selectedBooking ? selectedBooking.id : '')
                  }
                >
                  <Text className="text-white text-center font-semibold">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showTimeWarningModal} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View className="bg-white rounded-xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-center mb-4">
                Cannot Delete
              </Text>
              <Text className="text-center text-gray-700 mb-4">
                This booking starts in less than 15 minutes and cannot be deleted.
              </Text>

              <TouchableOpacity
                className="bg-teal-700 px-6 py-3 rounded-lg"
                onPress={() => setShowTimeWarningModal(false)}
              >
                <Text className="text-white text-center font-semibold">
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showMarkCompleteModal} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View className="bg-white rounded-xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-center mb-4">
                Mark as Complete
              </Text>
              <Text className="text-center text-gray-700 mb-4">
                Mark this booking as completed?
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                  onPress={() => setShowMarkCompleteModal(false)}
                >
                  <Text className="text-center font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-green-500 px-6 py-3 rounded-lg flex-1 ml-2"
                  onPress={() =>
                    markBookingComplete(selectedBooking ? selectedBooking.id : '')
                  }
                >
                  <Text className="text-white text-center font-semibold">
                    Complete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <GestureDetector gesture={panGesture}>
          <Animated.View 
            style={[
              styles.animatedContainer,
              { width: SCREEN_WIDTH * 2 },
              animatedStyle
            ]}
          >
            <View style={[styles.tabContainer, { width: SCREEN_WIDTH }]}>
              <View style={styles.contentContainer}>
                {renderContent('upcoming')}
              </View>
            </View>
            <View style={[styles.tabContainer, { width: SCREEN_WIDTH }]}>
              <View style={styles.contentContainer}>
                {renderContent('completed')}
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
      </GestureHandlerRootView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabContainer: {
  },
  contentContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
});

export default ManageBookingsScreen;