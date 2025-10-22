import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import CommunicationMethod from '../../components/CommunicationMethod';
import Icon from 'react-native-vector-icons/Ionicons';

const ContactInfoScreen = () => {
  const [number, setNumber] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const methods = [{name: "Phone Number", icon: selected === "phone" ? "square" : "square-outline"}, {name: "Text Message", icon: selected === "text" ? "square" : "square-outline"}];

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
        value={number}
        onChangeText={text => setNumber(text.replace(/[^0-9]/g, ''))}
      />
      <Text className="font-bold">Preferred Communication Methods</Text>

      {methods.map((method) => (
        <CommunicationMethod key={method.name} method={method} setSelected={setSelected} />
      ))}

      <View className="p-4 bg-teal-100 rounded-xl flex-row">
        <Icon name="lock-closed" size={20} color="#008080" style={{ marginRight: 16 }} />
        <Text className="text-sm text-gray-600 flex-1">
          Your contact details will only be shared with a student after they
          have booked a session with you.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-teal-600 rounded-xl p-4 items-center justify-center mt-4"
        style={{ elevation: 5 }}
      >
        <Text className="font-bold text-white">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactInfoScreen;
