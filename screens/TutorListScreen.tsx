import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  formatTimeRange, 
  timestampToDate
} from '../utils/dateUtil';
import { useTutorSchedules } from '../hooks/useTutorSchedules';
import { TutorSchedule, ProcessedSlot } from '../types/index';

const TutorListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<TutorSchedule | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ProcessedSlot | null>(null);
  const [filteredTutors, setFilteredTutors] = useState<TutorSchedule[]>([]);
  const currentUser = auth().currentUser;
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { allTutors, isLoading } = useTutorSchedules(currentUser?.uid);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredTutors(allTutors);
        return;
      }

      const filtered = allTutors.filter(tutor => {
        const tutorData = tutor.tutorId;
        const nameMatch = tutorData?.name
          ?.toLowerCase()
          .includes(query.toLowerCase());
        const specialityMatch = tutorData?.profile?.speciality
          ?.toLowerCase()
          .includes(query.toLowerCase());
        return nameMatch || specialityMatch;
      });
      setFilteredTutors(filtered);
    }, 500);
  }, [allTutors]);

  useEffect(() => {
    setFilteredTutors(allTutors);
  }, [allTutors]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleBookSlot = (tutor: TutorSchedule, slot: ProcessedSlot) => {
    if (slot.isBooked) {
      Alert.alert(
        'Slot Unavailable',
        'This time slot has already been booked by another student.',
      );
      return;
    }

    setSelectedTutor(tutor);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedTutor || !selectedSlot || !currentUser) return;

    try {
      const tutorId = selectedTutor.tutorId.id;
      const firestoreTutorReference = firestore().collection('users').doc(tutorId);
      const firestoreStudentReference = firestore().collection('users').doc(currentUser.uid);

      const studentBookingsSnapshot = await firestore()
        .collection('bookings')
        .where('student', '==', firestoreStudentReference)
        .get();

      const hasTimeConflict = studentBookingsSnapshot.docs.some(doc => {
        const booking = doc.data();
        if (booking.bookedSlot) {
          const existingStart = timestampToDate(booking.bookedSlot.startTime);
          const existingEnd = timestampToDate(booking.bookedSlot.endTime);
          const newStart = timestampToDate(selectedSlot.startTime);
          const newEnd = timestampToDate(selectedSlot.endTime);

          return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          );
        }
        return false;
      });

      if (hasTimeConflict) {
        Alert.alert(
          'Booking Conflict',
          'You already have a booking at this time.',
        );
        return;
      }

      const studentSchedulesSnapshot = await firestore()
        .collection('schedules')
        .where('tutorId', '==', firestoreStudentReference)
        .get();

      const hasTeachingConflict = studentSchedulesSnapshot.docs.some(doc => {
        const schedule = doc.data();
        if (schedule.slots) {
          return schedule.slots.some((slot: any) => {
            const existingStart = timestampToDate(slot.startTime);
            const existingEnd = timestampToDate(slot.endTime);
            const newStart = timestampToDate(selectedSlot.startTime);
            const newEnd = timestampToDate(selectedSlot.endTime);

            return (
              (newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd)
            );
          });
        }
        return false;
      });

      if (hasTeachingConflict) {
        Alert.alert(
          'Teaching Conflict',
          'You have to teach during this time slot. Please choose a different time slot.',
        );
        return;
      }

      const scheduleRef = firestore()
        .collection('schedules')
        .doc(selectedSlot.scheduleId);

      const bookingData = {
        tutor: firestoreTutorReference,
        student: firestoreStudentReference,
        schedule: scheduleRef,
        bookedSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          price: selectedSlot.price,
        },
        ratings: 0,
        isPaid: true,
        review: '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('bookings').add(bookingData);

      setShowBookingModal(false);

      Alert.alert(
        'Booking Confirmed!',
        `Your session with ${selectedTutor.tutorId.name || 'the tutor'} on ${selectedSlot.day} has been booked.`,
        [{ text: 'OK' }],
      );

      setSelectedTutor(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book the session. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#FFD700" />,
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#FFD700"
        />,
      );
    }

    return stars;
  };

  const renderTutorCard = ({ item: tutor }: { item: TutorSchedule }) => (
    <View className="bg-white mx-4 mb-4 rounded-xl shadow-lg">
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {tutor.tutorId.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center mr-3">
                {renderStars(tutor.tutorId.profile?.rating || 0)}
                <Text className="ml-2 text-gray-600">
                  {tutor.tutorId.profile?.rating || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text className="text-gray-700 mb-3">{tutor.tutorId.profile?.bio || 'No bio available'}</Text>

        <View className="border-t border-gray-200 pt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Weekly Schedule
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {tutor.slots.map((slot: ProcessedSlot) => (
                <TouchableOpacity
                  key={slot.id}
                  className={`mr-3 p-3 rounded-lg min-w-[120px] ${
                    slot.isBooked
                      ? 'bg-gray-200'
                      : 'bg-teal-50 border-2 border-teal-200'
                  }`}
                  onPress={() => handleBookSlot(tutor, slot)}
                  disabled={slot.isBooked}
                >
                  <Text className="font-semibold text-center text-gray-800">
                    {slot.day}
                  </Text>
                  <Text className="text-center text-gray-700">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </Text>

                  <Text className="text-center text-teal-600 font-semibold">
                    ${slot.price}
                  </Text>
                  {slot.isBooked && (
                    <Text className="text-center text-red-600 text-xs mt-1">
                      Booked
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <Icon name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search tutors or subjects..."
            placeholderTextColor={'#666'}
            value={searchQuery}
            onChangeText={handleSearchChange}
            className="flex-1 ml-2 text-gray-800"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
        </View>
      ) : (
        <FlatList
          data={filteredTutors}
          keyExtractor={item => item.id}
          renderItem={renderTutorCard}
          className="py-4"
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showBookingModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">
              Confirm Booking
            </Text>

            {selectedTutor && selectedSlot && (
              <View>
                <Text className="text-gray-700 text-center mb-2">
                  Book a session with{' '}
                  {selectedTutor.tutorId.name || 'the tutor'}?
                </Text>
                <Text className="font-semibold text-center mb-4">
                  {selectedSlot.day} at {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}
                </Text>
                <Text className="text-center text-lg font-bold text-teal-600 mb-6">
                  Total: ${selectedSlot.price}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={() => setShowBookingModal(false)}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-teal-600 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={confirmBooking}
              >
                <Text className="text-white text-center font-semibold">
                  Book Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TutorListScreen;