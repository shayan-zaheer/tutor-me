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
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
  price: number;
}

interface TutorProfile {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  hourlyRate: number;
  bio: string;
  weeklySlots: TimeSlot[];
  contactDetails: {
    phone: string;
    whatsapp: string;
  };
}

const BecomeATutorScreen = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [formData, setFormData] = useState({
    expertise: '',
    hourlyRate: '',
    bio: '',
    phone: '',
    whatsapp: '',
  });
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    price: '',
  });
  const [showSlotModal, setShowSlotModal] = useState(false);

  const currentUser = auth().currentUser;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    // Check if user is already registered as tutor
    // In real app, check Firestore for existing tutor profile
    const checkTutorStatus = async () => {
      // Mock check - replace with Firebase query
      const mockProfile: TutorProfile = {
        id: currentUser?.uid || '1',
        name: currentUser?.displayName || 'Your Name',
        email: currentUser?.email || 'your@email.com',
        expertise: ['Mathematics', 'Physics'],
        hourlyRate: 30,
        bio: 'Experienced tutor with passion for teaching',
        weeklySlots: [
          { id: 'slot1', day: 'Monday', startTime: '10:00', endTime: '11:00', isBooked: false, price: 30 },
          { id: 'slot2', day: 'Wednesday', startTime: '14:00', endTime: '15:00', isBooked: true, bookedBy: 'student123', price: 30 },
        ],
        contactDetails: {
          phone: '+1-555-0123',
          whatsapp: '+1-555-0123',
        },
      };
      
      // Simulate existing tutor
      setIsRegistered(true);
      setTutorProfile(mockProfile);
    };

    if (currentUser) {
      checkTutorStatus();
    }
  }, [currentUser]);

  const handleRegisterAsTutor = () => {
    if (!formData.expertise || !formData.hourlyRate || !formData.bio || !formData.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const newProfile: TutorProfile = {
      id: currentUser?.uid || '',
      name: currentUser?.displayName || 'Your Name',
      email: currentUser?.email || '',
      expertise: formData.expertise.split(',').map(skill => skill.trim()),
      hourlyRate: parseInt(formData.hourlyRate, 10),
      bio: formData.bio,
      weeklySlots: [],
      contactDetails: {
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
      },
    };

    setTutorProfile(newProfile);
    setIsRegistered(true);
    Alert.alert('Success!', 'You are now registered as a tutor. Add your weekly availability to start receiving bookings.');
  };

  const handleAddSlot = () => {
    if (!newSlot.price) {
      Alert.alert('Missing Price', 'Please set a price for this time slot');
      return;
    }

    if (!tutorProfile) return;

    const slot: TimeSlot = {
      id: `slot_${Date.now()}`,
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isBooked: false,
      price: parseInt(newSlot.price, 10),
    };

    const updatedProfile = {
      ...tutorProfile,
      weeklySlots: [...tutorProfile.weeklySlots, slot],
    };

    setTutorProfile(updatedProfile);
    setShowSlotModal(false);
    setNewSlot({ day: 'Monday', startTime: '09:00', endTime: '10:00', price: '' });
  };

  const removeSlot = (slotId: string) => {
    if (!tutorProfile) return;
    
    const slot = tutorProfile.weeklySlots.find(s => s.id === slotId);
    if (slot?.isBooked) {
      Alert.alert('Cannot Remove', 'This slot is already booked by a student');
      return;
    }

    const updatedProfile = {
      ...tutorProfile,
      weeklySlots: tutorProfile.weeklySlots.filter(s => s.id !== slotId),
    };

    setTutorProfile(updatedProfile);
  };

  const renderRegistrationForm = () => (
    <ScrollView className="flex-1 p-4">
      <View className="bg-white rounded-xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-center mb-6 text-teal-700">
          Register as a Tutor
        </Text>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-800">Expertise Areas *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="e.g., Mathematics, Physics, Programming (comma separated)"
            value={formData.expertise}
            onChangeText={(text) => setFormData({ ...formData, expertise: text })}
            multiline
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-800">Hourly Rate (USD) *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="e.g., 25"
            value={formData.hourlyRate}
            onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-800">Bio *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="Tell students about your experience and teaching style..."
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-800">Phone Number *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="e.g., +1-555-0123"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-800">WhatsApp (Optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="WhatsApp number (if different from phone)"
            value={formData.whatsapp}
            onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          className="bg-teal-600 py-4 rounded-lg"
          onPress={handleRegisterAsTutor}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Register as Tutor
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTutorDashboard = () => (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg mb-4">
          <Text className="text-2xl font-bold text-teal-700 mb-2">Tutor Dashboard</Text>
          <Text className="text-lg text-gray-800 mb-1">Welcome back, {tutorProfile?.name}!</Text>
          <Text className="text-gray-600">Rate: ${tutorProfile?.hourlyRate}/hour</Text>
        </View>

        <View className="bg-white rounded-xl p-6 shadow-lg mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">Weekly Schedule</Text>
            <TouchableOpacity
              className="bg-teal-600 px-4 py-2 rounded-lg"
              onPress={() => setShowSlotModal(true)}
            >
              <Text className="text-white font-semibold">+ Add Slot</Text>
            </TouchableOpacity>
          </View>

          {tutorProfile?.weeklySlots.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No time slots added yet. Add some slots to start receiving bookings!
            </Text>
          ) : (
            <FlatList
              data={tutorProfile?.weeklySlots}
              keyExtractor={(item) => item.id}
              renderItem={({ item: slot }) => (
                <View className={`p-4 rounded-lg mb-3 ${slot.isBooked ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="font-semibold text-gray-800">
                        {slot.day} • {slot.startTime} - {slot.endTime}
                      </Text>
                      <Text className="text-teal-600 font-semibold">${slot.price}</Text>
                      {slot.isBooked && (
                        <Text className="text-red-600 text-sm mt-1">
                          ✓ Booked by student
                        </Text>
                      )}
                    </View>
                    {!slot.isBooked && (
                      <TouchableOpacity
                        className="bg-red-500 px-3 py-2 rounded"
                        onPress={() => removeSlot(slot.id)}
                      >
                        <Text className="text-white text-sm">Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>

      {/* Add Time Slot Modal */}
      <Modal visible={showSlotModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">Add Time Slot</Text>
            
            <View className="mb-4">
              <Text className="font-semibold mb-2">Day of Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day}
                      className={`px-3 py-2 rounded-lg mr-2 ${
                        newSlot.day === day ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                      onPress={() => setNewSlot({ ...newSlot, day })}
                    >
                      <Text className={`text-sm ${
                        newSlot.day === day ? 'text-white' : 'text-gray-700'
                      }`}>
                        {day.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="font-semibold mb-2">Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        className={`px-3 py-2 rounded-lg mr-2 ${
                          newSlot.startTime === time ? 'bg-teal-600' : 'bg-gray-200'
                        }`}
                        onPress={() => setNewSlot({ ...newSlot, startTime: time })}
                      >
                        <Text className={`text-sm ${
                          newSlot.startTime === time ? 'text-white' : 'text-gray-700'
                        }`}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className="mb-4">
              <Text className="font-semibold mb-2">End Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      className={`px-3 py-2 rounded-lg mr-2 ${
                        newSlot.endTime === time ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                      onPress={() => setNewSlot({ ...newSlot, endTime: time })}
                    >
                      <Text className={`text-sm ${
                        newSlot.endTime === time ? 'text-white' : 'text-gray-700'
                      }`}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="font-semibold mb-2">Price (USD)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., 30"
                value={newSlot.price}
                onChangeText={(text) => setNewSlot({ ...newSlot, price: text })}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={() => setShowSlotModal(false)}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-teal-600 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={handleAddSlot}
              >
                <Text className="text-white text-center font-semibold">Add Slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Icon name="person-add" size={80} color="#14b8a6" />
        <Text className="text-xl font-bold text-center mt-4 mb-2">
          Sign In Required
        </Text>
        <Text className="text-gray-600 text-center">
          Please sign in to register as a tutor
        </Text>
      </View>
    );
  }

  return isRegistered ? renderTutorDashboard() : renderRegistrationForm();
};

export default BecomeATutorScreen;