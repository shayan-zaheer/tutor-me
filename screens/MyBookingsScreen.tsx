import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { PageContainer } from '../components/PageContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import { Booking } from '../types';
import { 
  formatBookingCardDisplay, 
  getCurrentDate, 
  timestampToDate,
  sortBookingsByDate
} from '../utils/dateUtil';
import { bookingService } from '../services/bookingService';
import { GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useTabGesture } from '../hooks/useTabGesture';

const BookingSections = ({ bookings, renderBookingCard, tab }: { 
  bookings: Booking[], 
  renderBookingCard: ({ item }: { item: any }) => React.JSX.Element,
  tab: 'upcoming' | 'completed',
}) => {
  const now = getCurrentDate();
  const upcomingBookings = sortBookingsByDate(bookings.filter(
    booking => timestampToDate(booking.bookedSlot.startTime) >= now,
  ));
  const pastBookings = sortBookingsByDate(bookings.filter(
    booking => timestampToDate(booking.bookedSlot.startTime) < now,
  ));

  const sectionsData = [];
  
  if (tab === 'upcoming' && upcomingBookings.length > 0) {
    sectionsData.push(...upcomingBookings.map(booking => ({ type: 'booking', ...booking })));
  }
  
  if (tab === 'completed' && pastBookings.length > 0) {
    sectionsData.push(...pastBookings.map(booking => ({ type: 'booking', ...booking })));
  }

  const renderItem = ({ item }: { item: any }) => {
    return renderBookingCard({ item });
  };

  if (sectionsData.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Icon name="calendar-outline" size={80} color="#14b8a6" />
        <Text className="text-xl font-bold text-center mt-4 mb-2">
          {tab === 'upcoming' ? 'No Upcoming Sessions' : 'No Completed Sessions'}
        </Text>
        <Text className="text-gray-600 text-center">
          {tab === 'upcoming' 
            ? 'Book a session with a tutor to get started!' 
            : 'Your completed sessions will appear here.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sectionsData}
      keyExtractor={item => (item as any).key || (item as any).id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      className="pb-5"
    />
  );
};

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [review, setReview] = useState('');
  const currentUser = auth().currentUser;

  const { selectedTab, switchToTab, animatedStyle, panGesture, SCREEN_WIDTH } = useTabGesture();

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);

    const unsubscribe = bookingService.getStudentBookingsRealTime(
      currentUser.uid,
      (populatedBookings) => {
        console.log('Real-time update received:', populatedBookings.length, 'bookings');
        setBookings(populatedBookings);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const deleteBooking = async (bookingId: string) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      Alert.alert('Success', 'Booking deleted successfully');
      setShowDeleteModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking');
    }
  };

  const handleRate = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(booking.rating || 0);
    setReview(booking.review || '');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedBooking) return;

    if (rating === 0) {
      Alert.alert(
        'Rating Required',
        'Please select a rating before submitting',
      );
      return;
    }

    setIsSubmittingRating(true);

    try {
      await bookingService.submitRating(
        selectedBooking.id,
        rating,
        review,
        (selectedBooking.tutor as any).id
      );

      setShowRatingModal(false);
      setSelectedBooking(null);
      setRating(0);
      setReview('');

      Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <TouchableOpacity
        key={i + 1}
        onPress={interactive ? () => setRating(i + 1) : undefined}
        disabled={!interactive}
      >
        <Icon
          name={i + 1 <= currentRating ? 'star' : 'star-outline'}
          size={24}
          color="#FFD700"
        />
      </TouchableOpacity>
    ));
  };

  const renderBookingCard = ({ item: booking }: { item: any }) => {
    const now = getCurrentDate();
    const bookingTime = timestampToDate(booking.bookedSlot.startTime);
    const isPastBooking = bookingTime < now;

    return (
      <View
        className={`mx-4 mb-4 rounded-xl shadow-lg ${
          isPastBooking ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        <View className="p-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-xl font-bold text-gray-800 mb-1">
                  {booking.tutor?.name ?? 'Unknown Tutor'}
                </Text>
              </View>
              <Text className="text-lg text-teal-600 font-semibold mb-2">
                {booking.tutor?.profile?.speciality ?? 'No Speciality'}
              </Text>

              <View className="flex-row items-center mb-1">
                <Icon name="calendar-outline" size={16} color="#666" />
                <Text
                  className={`ml-2 ${
                    isPastBooking ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {formatBookingCardDisplay(booking.bookedSlot.startTime, booking.bookedSlot.endTime)}
                  | {'$' + booking.bookedSlot.price}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Icon name="card-outline" size={16} color="#666" />
                <Text
                  className={`ml-2 font-semibold ${
                    isPastBooking ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {booking.isPaid ? 'Paid' : 'Not Paid'}
                </Text>
              </View>
            </View>
            {!isPastBooking && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBooking(booking);
                  setShowDeleteModal(true);
                }}
              >
                <Icon name="trash" size={22} color="#008080" />
              </TouchableOpacity>
            )}
          </View>

          <View className="border-t border-gray-200 pt-4">
            {booking.ratings ? (
              <View>
                <Text
                  className={`font-semibold mb-2 ${
                    isPastBooking ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  Your Review:
                </Text>
                <View className="flex-row items-center mb-2">
                  {renderStars(booking.ratings)}
                </View>
                {booking.review && (
                  <Text
                    className={`italic ${
                      isPastBooking ? 'text-gray-500' : 'text-gray-600'
                    }`}
                  >
                    "{booking.review}"
                  </Text>
                )}
              </View>
            ) : isPastBooking ? (
              <TouchableOpacity
                className="bg-yellow-500 py-3 px-4 rounded-lg"
                onPress={() => handleRate(booking)}
              >
                <Text className="text-white text-center font-semibold">
                  Rate This Session
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-blue-100 py-3 px-4 rounded-lg">
                <Text className="text-center font-semibold text-blue-700">
                  Upcoming Session
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <PageContainer 
      enableKeyboardAvoiding={false}
      backgroundColor="#f9fafb"
    >
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
        </View>
      ) : bookings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Icon name="calendar-outline" size={80} color="#14b8a6" />
          <Text className="text-xl font-bold text-center mt-4 mb-2">
            No Bookings Yet
          </Text>
          <Text className="text-gray-600 text-center">
            Book a session with a tutor to get started!
          </Text>
        </View>
      ) : (
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

            <GestureDetector gesture={panGesture}>
              <Animated.View 
                style={[
                  {
                    flex: 1,
                    flexDirection: 'row',
                    width: SCREEN_WIDTH * 2,
                  },
                  animatedStyle
                ]}
              >
                <View style={{ width: SCREEN_WIDTH }}>
                  <View style={{ paddingHorizontal: 16, flex: 1 }}>
                    <BookingSections 
                      bookings={bookings} 
                      renderBookingCard={renderBookingCard}
                      tab="upcoming"
                    />
                  </View>
                </View>
                <View style={{ width: SCREEN_WIDTH }}>
                  <View style={{ paddingHorizontal: 16, flex: 1 }}>
                    <BookingSections 
                      bookings={bookings} 
                      renderBookingCard={renderBookingCard}
                      tab="completed"
                    />
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      )}

      <Modal visible={showRatingModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">
              Rate Your Session
            </Text>

            {selectedBooking && (
              <View className="mb-6">
                <Text className="text-center text-gray-700 mb-4">
                  How was your session with{' '}
                  {(selectedBooking.tutor as any)?.name || 'this tutor'}?
                </Text>

                <View className="flex-row justify-center mb-4">
                  {renderStars(rating, true)}
                </View>

                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="Write a review (optional)..."
                  placeholderTextColor={'#666'}
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={() => setShowRatingModal(false)}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-yellow-500 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={submitRating}
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
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
    </PageContainer>
  );
};

export default MyBookingsScreen;
