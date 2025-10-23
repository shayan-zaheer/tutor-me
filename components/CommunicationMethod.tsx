import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CommunicationMethod = ({ method, setSelected }: { method: any, setSelected: any }) => {
  return (
    <TouchableOpacity onPress={() => setSelected(method.name.split(" ")[0].toLowerCase())}>
      <View className="flex-row px-3 py-4 justify-between items-center border border-gray-300 rounded-xl bg-white">
        <Text className="text-black">{method.name}</Text>
        <Icon name={method.icon} size={20} color="#008080" />
      </View>
    </TouchableOpacity>
  );
};

export default CommunicationMethod;