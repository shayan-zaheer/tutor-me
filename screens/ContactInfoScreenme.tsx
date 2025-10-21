import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

const ContactInfoScreen = () => {
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
      />
      <Text className="font-bold">Preferred Communication Methods</Text>

      <TouchableOpacity onPress={() => {}}>
        <View className="flex-row px-3 py-4 justify-between items-center border border-gray-300 rounded-xl bg-white">
          <Text className="text-black">Phone Call</Text>
          <Icon name="checkbox-outline" size={20} color="#1193D4" />
        </View>
      </TouchableOpacity>

      <View className="flex-row px-3 py-4 justify-between items-center border border-gray-300 rounded-xl bg-white">
        <Text className="text-black">Text Message</Text>
        <Icon name="square-outline" size={20} color="#1193D4" />
      </View>

      <View className="p-4 bg-[#DFECF4] rounded-xl flex-row">
        <Icon name="lock-closed" size={20} color="#1193D4" style={{ marginRight: 16 }} />
        <Text className="text-sm text-gray-600 flex-1">
          Your contact details will only be shared with a student after they
          have booked a session with you.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-[#1193D4] rounded-xl p-4 items-center justify-center mt-4"
        style={{ elevation: 5 }}
      >
        <Text className="font-bold text-white">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactInfoScreen;
