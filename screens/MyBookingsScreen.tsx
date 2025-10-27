import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { Booking } from '../types';
import { populateReferences } from '../utils/populateReferences';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [review, setReview] = useState('');
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);

    const selfRef = firestore().collection('users').doc(currentUser?.uid);
    const unsubscribe = firestore()
      .collection('bookings')
      .where('student', '==', selfRef)
      .onSnapshot(async snapshot => {
        try {
          const populatedBookings = await Promise.all(
            snapshot.docs.map(async doc => {
              const populated = await populateReferences(doc.data());
              return { id: doc.id, ...populated };
            }),
          );
          setBookings(populatedBookings);
          console.log('Populated Bookings:', populatedBookings);
          setIsLoading(false);
        } catch (err) {
          console.error('Error populating booking references:', err);
          setIsLoading(false);
        }
      });

    return () => unsubscribe();
  }, [currentUser]);

  const deleteBooking = async (bookingId: string) => {
    try {
      await firestore().collection('bookings').doc(bookingId).delete();
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
    setRating(booking.rating || booking.ratings || 0);
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

    try {
      await firestore().collection('bookings').doc(selectedBooking.id).update({
        ratings: rating,
        review: review,
      });

      const tutorRef = firestore().collection("users").doc((selectedBooking.tutor as any).id);
      
      const currentRating = selectedBooking?.tutor?.profile?.rating || 0;
      const currentTotalReviews = selectedBooking?.tutor?.profile?.totalReviews || 0;

      const newTotalReviews = currentTotalReviews + 1;
      const newAverageRating = ((currentRating * currentTotalReviews) + rating) / newTotalReviews;
      
      await tutorRef.update({
        'profile.rating': newAverageRating,
        'profile.totalReviews': firestore.FieldValue.increment(1),
      });
    } catch (error) {
      console.error('Error updating booking:', error);
    }

    const updatedBookings = bookings.map(b =>
      b.id === selectedBooking.id ? { ...b, rating, review } : b,
    );

    setBookings(updatedBookings);
    setShowRatingModal(false);
    setSelectedBooking(null);
    setRating(0);
    setReview('');

    Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
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
    const now = new Date();
    const bookingTime = booking.bookedSlot.startTime.toDate();
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
                {isPastBooking && (
                  <View className="ml-2 px-2 py-1 bg-gray-300 rounded-full">
                    <Text className="text-xs text-gray-600 font-semibold">
                      PAST
                    </Text>
                  </View>
                )}
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
    <View className="flex-1 bg-gray-50">
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {(() => {
            const now = new Date();
            const upcomingBookings = bookings.filter(
              booking => booking.bookedSlot.startTime.toDate() >= now,
            );
            const pastBookings = bookings.filter(
              booking => booking.bookedSlot.startTime.toDate() < now,
            );

            return (
              <View className="mt-4">
                {upcomingBookings.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-800 mx-4 mb-4">
                      Upcoming Sessions
                    </Text>
                    <FlatList
                      data={upcomingBookings}
                      keyExtractor={item => item.id}
                      renderItem={renderBookingCard}
                      scrollEnabled={false}
                    />
                  </View>
                )}

                {pastBookings.length > 0 && (
                  <View>
                    <Text className="text-xl font-bold text-gray-800 mx-4 mb-4">
                      Past Sessions
                    </Text>
                    <FlatList
                      data={pastBookings}
                      keyExtractor={item => item.id}
                      renderItem={renderBookingCard}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </View>
            );
          })()}
        </ScrollView>
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
              >
                <Text className="text-white text-center font-semibold">
                  Submit
                </Text>
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
    </View>
  );
};

export default MyBookingsScreen;
