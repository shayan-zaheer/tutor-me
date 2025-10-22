import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { Schedule, Tutor } from '../types';

const TutorListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const selfRef = firestore().collection("users").doc(currentUser?.uid);
    const unsubscribe = firestore()
      .collection('schedules')
      .where("tutorId", "!=", selfRef)
      .onSnapshot(async snapshot => {
        const schedulesData: Schedule[] = snapshot.docs.map(doc => ({
          id: doc.id,
          tutorId: doc.data().tutorId,
          slots: doc.data().slots ?? [],
        }));

        const tutorIds = [
          ...new Set(
            schedulesData
              .map(s =>
                typeof s.tutorId === 'string' ? s.tutorId : s.tutorId?.id,
              )
              .filter(Boolean) as string[],
          ),
        ];

        if (tutorIds.length === 0) {
          setTutors([]);
          return;
        }

        let tutorsData: Tutor[] = [];
        const batchSize = 10;
        for (let i = 0; i < tutorIds.length; i += batchSize) {
          const chunk = tutorIds.slice(i, i + batchSize);
          const tutorsSnapshot = await firestore()
            .collection('users')
            .where(firestore.FieldPath.documentId(), 'in', chunk)
            .get();

          tutorsData.push(
            ...tutorsSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Tutor))
              .filter(t => t.profile),
          );
        }

        const tutorsWithSlots = tutorsData.map(tutor => {
          const tutorSchedules = schedulesData.filter(s => {
            const tutorId =
              typeof s.tutorId === 'string' ? s.tutorId : s.tutorId?.id;
            return tutorId === tutor.id;
          });
          const weeklySlots = tutorSchedules.flatMap(s => 
            s.slots.map((slot, index) => ({
              ...slot,
              id: `${s.id}-${index}`,
              day: slot.startTime.toDate().toLocaleDateString('en-GB', { weekday: 'long' }),
            }))
          );
          return { ...tutor, weeklySlots };
        });

        setTutors(tutorsWithSlots);
      });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    const selfRef = firestore().collection("users").doc(currentUser?.uid);
    const unsubscribe = firestore().collection("bookings").where("student", "==", selfRef).onSnapshot(snapshot => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, []);

  const [tutors, setTutors] = useState<Tutor[]>([]);

  const handleBookSlot = (tutor: Tutor, slot: TimeSlot) => {
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

    const tutorRef = firestore().collection('users').doc(selectedTutor.id);
    const selfRef = firestore().collection('users').doc(currentUser.uid);

    await firestore().collection("bookings").add({
      tutor: tutorRef,
      student: selfRef,
      schedule: firestore().collection("schedules").doc(selectedTutor.id),
      ratings: 0,
      isPaid: true,
      review: "",
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    const updatedTutors = tutors.map(tutor => {
      if (tutor.id === selectedTutor.id) {
        const updatedSlots = tutor.weeklySlots.map(slot => {
          if (slot.id === selectedSlot.id) {
            return { ...slot, isBooked: true, bookedBy: currentUser.uid };
          }
          return slot;
        });
        return { ...tutor, weeklySlots: updatedSlots };
      }
      return tutor;
    });

    setTutors(updatedTutors);
    setShowBookingModal(false);

    Alert.alert(
      'Booking Confirmed!',
      `Your session with ${selectedTutor.name} on ${selectedSlot.day} at ${selectedSlot.startTime} has been booked.`,
      [{ text: 'OK' }],
    );

    setSelectedTutor(null);
    setSelectedSlot(null);
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

  const renderTutorCard = ({ item: tutor }) => (
    <View className="bg-white mx-4 mb-4 rounded-xl shadow-lg">
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {tutor.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center mr-3">
                {renderStars(tutor.profile.rating)}
                <Text className="ml-2 text-gray-600">
                  {tutor.profile.rating}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text className="text-gray-700 mb-3">{tutor.profile.bio}</Text>

        <View className="border-t border-gray-200 pt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Weekly Schedule
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {tutor.weeklySlots.map(slot => (
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
                      minute: '2-digit'
                    })} - {slot.endTime.toDate().toLocaleTimeString('en-GB', {
                      hour: '2-digit', 
                      minute: '2-digit'
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-800"
          />
        </View>
      </View>

      <FlatList
        data={tutors}
        keyExtractor={item => item.id}
        renderItem={renderTutorCard}
        className="py-4"
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showBookingModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">
              Confirm Booking
            </Text>

            {selectedTutor && selectedSlot && (
              <View>
                <Text className="text-gray-700 text-center mb-2">
                  Book a session with {selectedTutor.name}?
                </Text>
                <Text className="font-semibold text-center mb-4">
                  {selectedSlot.day} at {selectedSlot.startTime.toDate().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {selectedSlot.endTime.toDate().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
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
