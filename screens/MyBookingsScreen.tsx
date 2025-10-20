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
} from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { Booking, Tutor, Schedule, TimeSlot } from '../types';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const currentUser = auth().currentUser;

  // Fetch bookings with populated schedule & tutor
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('bookings')
      // .where('studentId', '==', currentUser.uid)
      .onSnapshot(async snapshot => {
        const bookingsData: Booking[] = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();

            // Booking timestamp
            const createdAt = data.createdAt?.toDate?.() ?? null;

            // Resolve schedule
            const scheduleRef = data.scheduleId as FirebaseFirestoreTypes.DocumentReference;
            const scheduleDoc = await scheduleRef.get();
            let scheduleData: Schedule | null = scheduleDoc.data() as Schedule | null;

            if (scheduleData?.slots) {
              scheduleData = {
                ...scheduleData,
                slots: scheduleData.slots.map((slot: any) => ({
                  ...slot,
                  startTime: slot.startTime?.toDate?.() ?? new Date(),
                  endTime: slot.endTime?.toDate?.() ?? new Date(),
                })),
              };
            }

            // Resolve tutor
            const tutorRef = data.tutorId as FirebaseFirestoreTypes.DocumentReference;
            const tutorDoc = await tutorRef.get();
            let tutorData: Tutor | null = tutorDoc.data() as Tutor | null;

            if (tutorData?.createdAt) tutorData.createdAt = tutorData.createdAt.toDate();
            if (tutorData?.updatedAt) tutorData.updatedAt = tutorData.updatedAt.toDate();

            return {
              id: doc.id,
              createdAt,
              isPaid: data.isPaid ?? false,
              rating: data.ratings ?? 0,
              review: data.review ?? '',
              status: data.status ?? 'upcoming',
              schedule: scheduleData ? { id: scheduleDoc.id, ...scheduleData } : null,
              tutor: tutorData ? { id: tutorDoc.id, ...tutorData } : null,
            } as Booking;
          })
        );

        setBookings(bookingsData);
      });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRate = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(booking.ratings || 0);
    setReview(booking.review || '');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (!selectedBooking) return;

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    const updatedBookings = bookings.map(b =>
      b.id === selectedBooking.id ? { ...b, rating, review } : b
    );

    setBookings(updatedBookings);
    setShowRatingModal(false);
    setSelectedBooking(null);
    setRating(0);
    setReview('');

    Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
  };

  // Cancel booking
  const cancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your session with ${booking.tutor?.name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            const updatedBookings = bookings.map(b =>
              b.id === booking.id ? { ...b, status: 'cancelled' } : b
            );
            setBookings(updatedBookings);
            Alert.alert('Cancelled', 'Your booking has been cancelled.');
          },
        },
      ]
    );
  };

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'time-outline';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'ellipse-outline';
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

  // Booking Card
  const renderBookingCard = ({ item: booking }: { item: Booking }) => (
    <View className="bg-white mx-4 mb-4 rounded-xl shadow-lg">
      <View className="p-6">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {booking.tutor?.name ?? 'Unknown Tutor'}
            </Text>
            <Text className="text-lg text-teal-600 font-semibold mb-2">
              {booking.tutor?.profile?.speciality ?? 'No Speciality'}
            </Text>

            {booking.schedule?.slots?.map((slot: TimeSlot, idx: number) => (
              <View className="flex-row items-center mb-1" key={idx}>
                <Icon name="calendar-outline" size={16} color="#666" />
                <Text className="ml-2 text-gray-700">
                  {slot.startTime.toLocaleString()} - {slot.endTime.toLocaleString()} | ${slot.price}
                </Text>
              </View>
            ))}

            <View className="flex-row items-center mb-3">
              <Icon name="card-outline" size={16} color="#666" />
              <Text className="ml-2 text-gray-700 font-semibold">
                {booking.isPaid ? 'Paid' : 'Not Paid'}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-center mb-2">
              <Icon
                name={getStatusIcon(booking.status)}
                size={20}
                color={
                  booking.status === 'upcoming'
                    ? '#3b82f6'
                    : booking.status === 'completed'
                    ? '#10b981'
                    : '#ef4444'
                }
              />
              <Text className={`ml-2 font-semibold capitalize ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Text>
            </View>
          </View>
        </View>

        {booking.status === 'completed' && (
          <View className="border-t border-gray-200 pt-4">
            {booking.rating ? (
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Your Rating:
                </Text>
                <View className="flex-row items-center mb-2">
                  {renderStars(booking.rating)}
                </View>
                {booking.review && (
                  <Text className="text-gray-600 italic">
                    "{booking.review}"
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                className="bg-yellow-500 py-3 px-4 rounded-lg"
                onPress={() => handleRate(booking)}
              >
                <Text className="text-white text-center font-semibold">
                  ⭐ Rate This Session
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {booking.status === 'upcoming' && (
          <View className="border-t border-gray-200 pt-4">
            <TouchableOpacity
              className="bg-red-500 py-3 px-4 rounded-lg"
              onPress={() => cancelBooking(booking)}
            >
              <Text className="text-white text-center font-semibold">
                Cancel Booking
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Icon name="book-outline" size={80} color="#14b8a6" />
        <Text className="text-xl font-bold text-center mt-4 mb-2">
          Sign In Required
        </Text>
        <Text className="text-gray-600 text-center">
          Please sign in to view your bookings
        </Text>
      </View>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <View className="flex-1 bg-gray-50">
      {bookings.length === 0 ? (
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
          {upcomingBookings.length > 0 && (
            <View className="mt-4">
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
            <View className="mt-4">
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
        </ScrollView>
      )}

      {/* Rating Modal */}
      <Modal visible={showRatingModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">
              Rate Your Session
            </Text>

            {selectedBooking && (
              <View className="mb-6">
                <Text className="text-center text-gray-700 mb-4">
                  How was your session with {selectedBooking.tutor?.name}?
                </Text>

                <View className="flex-row justify-center mb-4">
                  {renderStars(rating, true)}
                </View>

                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="Write a review (optional)..."
                  placeholderTextColor={'#000'}
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
    </View>
  );
};

export default MyBookingsScreen;
