import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

const AvailabilityScreen = () => {
  const [day, setDay] = useState<string>('Monday');
  const [slots, setSlots] = useState<Array<any>>([
    { id: '1', time: '09:00 AM - 11:00 AM', difference: '2 hours' },
    { id: '2', time: '01:00 PM - 03:00 PM', difference: '2 hours' },
    { id: '3', time: '04:00 PM - 06:00 PM', difference: '2 hours' },
  ]);

  const handleDayTap = (selectedDay: string) => {
    setDay(selectedDay);
  };

  const renderSlotItem = ({ item }: { item: any }) => (
      <View className="flex-row items-center justify-between p-4 rounded-lg bg-white drop-shadow-xl">
        <View className="flex-row">
          <View className="flex items-center justify-center p-2 rounded-lg bg-[#CFE9F6]">
            <Icon name="time" size={20} color="#000" />
          </View>
          <View className="ml-3">
            <Text className="text-gray-800 font-semibold">{item.time}</Text>
            <Text className="text-gray-400">{item.difference}</Text>
          </View>
        </View>
        <Icon name="trash" size={20} color="#000" />
      </View>
  );

  const renderDays = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => handleDayTap(item)}>
      <View
        className={`p-4 rounded-full items-center justify-center ${
          day === item ? 'bg-[#1193D4]' : 'bg-[#C7E2F0]'
        }`}
      >
        <Text className={`${day === item ? 'text-white font-bold' : 'text-[#1193D4]'}`}>
          {item.substring(0, 3)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <View className="p-4 gap-y-4">
      <Text>
        Select a day and add the times you're available to tutor each week.
      </Text>

      <FlatList
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderDays}
        keyExtractor={(item, index) => index.toString()}
        contentContainerClassName="gap-x-1"
      />

      <FlatList
        data={slots}
        horizontal={false}
        keyExtractor={item => item.id}
        renderItem={renderSlotItem}
        contentContainerStyle={{ elevation: 5 }}
        contentContainerClassName="gap-y-2"
      />

      <View className="items-center">
        <TouchableOpacity className="p-4 bg-[#C7E2F0] rounded-lg flex-row items-center justify-center gap-x-2 w-full">
          <Icon name="add" size={20} color="#1193D4" />
          <Text className="text-[#1193D4] font-semibold text-lg">
            Add Time Slot
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ elevation: 5 }}
        className="p-4 rounded-lg bg-[#1193D4]"
        onPress={() => {}}
      >
        <Text className="text-center text-white font-bold text-lg">
          Save & Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AvailabilityScreen;