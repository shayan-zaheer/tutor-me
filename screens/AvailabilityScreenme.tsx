import { Text, View } from 'react-native';
import React from 'react';

const AvailabilityScreen = () => {
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
    <View>
      <Text>
        Select a day and add the times you're available to tutor each week.
      </Text>
      <View>
        {days.map(day => (
          <View
            key={day}
            className="flex-row justify-between items-center bg-[#1193D4]"
          >
            <Text>{day}</Text>
            <Text className="text-blue-500">Add Time</Text>
          </View>
        ))}
      </View>

      <View>
        <View className="flex-row">
          <View className="px-3">
            <View className="p-4 bg-[#CFE9F6]">
              <Text>C</Text>
            </View>
          </View>
        </View>

        <View></View>
      </View>
    </View>
  );
};

export default AvailabilityScreen;
