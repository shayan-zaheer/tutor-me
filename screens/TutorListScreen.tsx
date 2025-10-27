import { useState, useEffect, useCallback, useRef } from 'react';
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
import { populateReferences } from '../utils/populateReferences';
import { Tutor } from '../types';

const TutorListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const currentUser = auth().currentUser;
  const debounceTimeout = useRef<any>(null);

  const debouncedSearch = useCallback((query: string, tutors: any[]) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredTutors(tutors);
        return;
      }

      const filtered = tutors.filter(tutor => {
        const tutorData = (tutor as any).tutorId;
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
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const selfRef = firestore().collection('users').doc(currentUser?.uid);

    let latestSchedules: any[] = [];
    let latestBookings: any[] = [];

    const processAndSet = (schedulesData: any[], bookingsData: any[]) => {
      try {
        const now = new Date();

        const bookedSlots = new Set<string>();
        bookingsData.forEach(b => {
          const booking = b;
          if (!booking || !booking.bookedSlot) return;
          const tutorId = booking.tutor?.id;
          const start =
            booking.bookedSlot.startTime?.toMillis?.() ??
            booking.bookedSlot.startTime;
          const end =
            booking.bookedSlot.endTime?.toMillis?.() ??
            booking.bookedSlot.endTime;
          if (tutorId && start && end) {
            bookedSlots.add(`${tutorId}-${start}-${end}`);
          }
        });

        const tutorsWithBookingStatus = schedulesData
          .map((schedule: any) => {
            const tutorId = schedule.tutorId?.id;
            const slotsWithStatus = (schedule.slots || [])
              .filter((slot: any) => slot.startTime.toDate() >= now)
              .map((slot: any, index: number) => {
                const startMillis = slot.startTime.toMillis();
                const endMillis = slot.endTime.toMillis();
                const slotKey = `${tutorId}-${startMillis}-${endMillis}`;
                const isBooked = bookedSlots.has(slotKey);

                return {
                  ...slot,
                  id: `${schedule.id}-${index}`,
                  scheduleId: schedule.id,
                  day: `${slot.startTime
                    .toDate()
                    .toLocaleDateString('en-GB', { weekday: 'long' })
                    .substring(0, 3)} ${slot.startTime
                    .toDate()
                    .toLocaleDateString('en-GB')}`,
                  isBooked,
                };
              });

            return { ...schedule, slots: slotsWithStatus };
          })
          .filter((s: any) => (s.slots || []).length > 0);

        setAllTutors(tutorsWithBookingStatus);
        setFilteredTutors(tutorsWithBookingStatus);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in processing schedules/bookings:', err);
        setIsLoading(false);
      }
    };

    const schedulesUnsub = firestore()
      .collection('schedules')
      .where('tutorId', '!=', selfRef)
      .onSnapshot(async schedulesSnapshot => {
        try {
          const populated = await Promise.all(
            schedulesSnapshot.docs.map(async (doc: any) => {
              const data = doc.data();
              const populatedData = await populateReferences(data);
              return { id: doc.id, ...populatedData };
            }),
          );
          latestSchedules = populated;
          processAndSet(latestSchedules, latestBookings);
        } catch (err) {
          console.error('Error populating schedules:', err);
          setIsLoading(false);
        }
      });

    const bookingsUnsub = firestore()
      .collection('bookings')
      .onSnapshot(bookingsSnapshot => {
        try {
          latestBookings = bookingsSnapshot.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
          processAndSet(latestSchedules, latestBookings);
        } catch (err) {
          console.error('Error reading bookings:', err);
          setIsLoading(false);
        }
      });

    return () => {
      schedulesUnsub();
      bookingsUnsub();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    debouncedSearch(searchQuery, allTutors);
  }, [searchQuery, allTutors, debouncedSearch]);

  const handleBookSlot = (tutor: Tutor, slot: any) => {
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
      const tutorId = (selectedTutor as any).tutorId?.id || selectedTutor.id;
      const tutorRef = firestore().collection('users').doc(tutorId);
      const selfRef = firestore().collection('users').doc(currentUser.uid);

      const studentBookingsSnapshot = await firestore()
        .collection('bookings')
        .where('student', '==', selfRef)
        .get();

      const hasTimeConflict = studentBookingsSnapshot.docs.some(doc => {
        const booking = doc.data();
        if (booking.bookedSlot) {
          const existingStart = booking.bookedSlot.startTime.toDate();
          const existingEnd = booking.bookedSlot.endTime.toDate();
          const newStart = selectedSlot.startTime.toDate();
          const newEnd = selectedSlot.endTime.toDate();

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
        .where('tutorId', '==', selfRef)
        .get();

      const hasTeachingConflict = studentSchedulesSnapshot.docs.some(doc => {
        const schedule = doc.data();
        if (schedule.slots) {
          return schedule.slots.some((slot: any) => {
            const existingStart = slot.startTime.toDate();
            const existingEnd = slot.endTime.toDate();
            const newStart = selectedSlot.startTime.toDate();
            const newEnd = selectedSlot.endTime.toDate();

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
        tutor: tutorRef,
        student: selfRef,
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
        `Your session with ${
          (selectedTutor as any).tutorId?.name || 'the tutor'
        } on ${selectedSlot.day} has been booked. His contact number is ${
          (selectedTutor as any)?.tutorId?.contact
        }. Copy it because due to privacy policies, you won't be able to see it again.`,
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

  const renderTutorCard = ({ item: tutor }: { item: any }) => (
    <View className="bg-white mx-4 mb-4 rounded-xl shadow-lg">
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {tutor.tutorId.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center mr-3">
                {renderStars(tutor.tutorId.profile.rating)}
                <Text className="ml-2 text-gray-600">
                  {tutor.tutorId.profile.rating}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text className="text-gray-700 mb-3">{tutor.tutorId.profile.bio}</Text>

        <View className="border-t border-gray-200 pt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Weekly Schedule
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {tutor.slots.map((slot: any) => (
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
                    {slot.startTime.toDate().toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -
                    {slot.endTime.toDate().toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
            onChangeText={setSearchQuery}
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
                  {(selectedTutor as any).tutorId?.name || 'the tutor'}?
                </Text>
                <Text className="font-semibold text-center mb-4">
                  {selectedSlot.day} at{' '}
                  {selectedSlot.startTime.toDate().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {selectedSlot.endTime.toDate().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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