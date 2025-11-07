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
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { PageContainer } from '../components/PageContainer';
import { 
  formatTimeRange, 
  calculateSlotPrice
} from '../utils/dateUtil';
import { useTutorSchedules } from '../hooks/useTutorSchedules';
import { ScheduleData as TutorSchedule, ProcessedSlot } from '../types/index';
import { bookingService } from '../services/bookingService';

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

      const hasBookingConflict = await bookingService.checkStudentBookingConflict(
        currentUser.uid,
        selectedSlot.startTime,
        selectedSlot.endTime
      );

      if (hasBookingConflict) {
        Alert.alert(
          'Booking Conflict',
          'You already have a booking at this time.',
        );
        return;
      }

      const hasTeachingConflict = await bookingService.checkTeachingConflict(
        currentUser.uid,
        selectedSlot.startTime,
        selectedSlot.endTime
      );

      if (hasTeachingConflict) {
        Alert.alert(
          'Teaching Conflict',
          'You have to teach during this time slot. Please choose a different time slot.',
        );
        return;
      }

      const price = calculateSlotPrice(
        selectedSlot.startTime, 
        selectedSlot.endTime, 
        selectedTutor.tutorId.profile?.hourlyRate || 0
      );

      await bookingService.createBooking({
        tutorId,
        studentId: currentUser.uid,
        scheduleId: selectedSlot.scheduleId,
        slot: selectedSlot,
        price,
      });

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
                    PKR {calculateSlotPrice(slot.startTime, slot.endTime, tutor.tutorId.profile?.hourlyRate || 0)}
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
    <PageContainer 
      enableKeyboardAvoiding={false}
      backgroundColor="#f9fafb"
    >
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
      ) : filteredTutors.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Icon name="people-outline" size={80} color="#14b8a6" />
          <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
            No Tutors Available
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            There are currently no tutors available for your search criteria. Please try again later or adjust your filters.
          </Text>
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
                  Total: PKR {calculateSlotPrice(selectedSlot.startTime, selectedSlot.endTime, selectedTutor.tutorId.profile?.hourlyRate || 0)}
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
    </PageContainer>
  );
};

export default TutorListScreen;