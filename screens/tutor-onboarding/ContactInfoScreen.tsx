import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import CommunicationMethod from '../../components/CommunicationMethod';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../services/userService';

const ContactInfoScreen = () => {
  const currentUser = auth().currentUser;
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadUserProfile = async () => {
      try {
        const userData = await userService.getUserProfile(currentUser.uid);
        setNumber(userData?.contact || '');
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [currentUser?.uid]);

  const handleNumberSave = async () => {
    if (!number || !currentUser?.uid) return;
    try {
      await userService.updateUserContactInfo(currentUser.uid, number.toString());
    } catch (err) {
      console.error('Error saving contact info:', err);
    }
  };

  const [number, setNumber] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const methods = [
    {
      name: 'Phone Number',
      icon: selected === 'phone' ? 'square' : 'square-outline',
    },
    {
      name: 'Text Message',
      icon: selected === 'text' ? 'square' : 'square-outline',
    },
  ];

  return (
    <View className="px-4 py-6 gap-y-4">
      <Text className="text-4xl font-bold">Contact Information</Text>
      <Text className="text-gray-600">
        Provide your contact details so students can reach you after a
        successful booking
      </Text>
      <Text className="font-semibold">Phone Number</Text>
      <TextInput
        className="px-3 py-4 text-black border border-gray-300 rounded-xl"
        placeholder="+1 (555) 555 5555"
        placeholderTextColor={'#B4BAC3'}
        keyboardType="phone-pad"
        maxLength={11}
        value={number}
        onChangeText={text => setNumber(text.replace(/[^0-9]/g, ''))}
      />
      <Text className="font-bold">Preferred Communication Methods</Text>

      {methods.map(method => (
        <CommunicationMethod
          key={method.name}
          method={method}
          setSelected={setSelected}
        />
      ))}

      <View className="p-4 bg-teal-100 rounded-xl flex-row">
        <Icon
          name="lock-closed"
          size={20}
          color="#008080"
          style={styles.icon}
        />
        <Text className="text-sm text-gray-600 flex-1">
          Your contact details will only be shared with a student after they
          have booked a session with you.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-teal-600 rounded-xl p-4 items-center justify-center mt-4"
        style={styles.button}
        onPress={handleNumberSave}
      >
        <Text className="font-bold text-white">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactInfoScreen;

const styles = StyleSheet.create({
   button: {
    elevation: 5
   }, 
   icon: {
    marginRight: 16
   }
})