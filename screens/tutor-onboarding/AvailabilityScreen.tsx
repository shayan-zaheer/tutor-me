import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import 'react-native-get-random-values';
import { DAYS_OF_WEEK, DayOfWeek } from '../../constants/days';
import { 
  formatTimeRange, 
  timestampToDate, 
  getCurrentDate,
  formatDayName 
} from '../../utils/dateUtil';
import { getDateOccurrence } from '../../utils/getDateOccurrence';
import { scheduleService } from '../../services/scheduleService';
import { v4 as uuidv4 } from 'uuid';

interface SlotWithId {
  id: string;
  startTime: any;
  endTime: any;
  scheduleDocId: string;
}

const AvailabilityScreen = () => {
  const [showModal, setModal] = useState<boolean>(false);
  const [newSlot, setNewSlot] = useState<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>({
    day: DAYS_OF_WEEK[0],
    startTime: '',
    endTime: '',
  });
  const [slots, setSlots] = useState<Array<any>>([]);
  const [slotsWithMetadata, setSlotsWithMetadata] = useState<SlotWithId[]>([]);
  const currentUser = auth().currentUser;

  const deleteSlot = async (slotId: string) => {
    try {
      const slotToDelete = slotsWithMetadata.find(slot => slot.id === slotId);
      if (!slotToDelete) {
        console.error('Slot not found');
        return;
      }

      await scheduleService.deleteTimeSlot(slotId, slotToDelete.scheduleDocId);
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = scheduleService.getTutorSchedulesRealTime(
      currentUser.uid,
      (data) => {
        const now = getCurrentDate();
        const slotsMetadata: SlotWithId[] = [];
        
        const refined = data.flatMap((schedule: any) =>
          schedule.slots?.filter((slot: any) => {
            return timestampToDate(slot.startTime) >= now;
          }).map((slot: any) => {
            const slotId = slot.id || uuidv4();
            
            slotsMetadata.push({
              id: slotId,
              startTime: slot.startTime,
              endTime: slot.endTime,
              scheduleDocId: schedule.id,
            });

            return {
              id: slotId,
              time: formatTimeRange(slot.startTime, slot.endTime),
              day: formatDayName(slot.startTime, 'long'),
              difference: `${
                +timestampToDate(slot.endTime).getHours() -
                +timestampToDate(slot.startTime).getHours()
              } hours`,
            };
          }),
        );

        setSlotsWithMetadata(slotsMetadata);
        setSlots(refined);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const renderSlotItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-4 rounded-lg bg-white drop-shadow-xl">
      <View className="flex-row">
        <View className="flex items-center justify-center p-2 rounded-lg bg-teal-100">
          <Icon name="time" size={20} color="#008080" />
        </View>
        <View className="ml-3">
          <Text className="text-gray-800 font-semibold">{item.time}</Text>
          <Text className="text-gray-400">{item.difference}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteSlot(item.id)}>
        <Icon name="trash" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderDays = ({ item }: { item: DayOfWeek }) => (
    <TouchableOpacity onPress={() => setNewSlot({ ...newSlot, day: item })}>
      <View
        className={`p-4 rounded-full items-center justify-center ${
          newSlot.day === item ? 'bg-teal-600' : 'bg-teal-100'
        }`}
      >
        <Text
          className={`${
            newSlot.day === item ? 'text-white font-bold' : 'text-teal-600'
          }`}
        >
          {item.substring(0, 3)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const days = DAYS_OF_WEEK;

  const timeOptions = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
  ];

  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime || !currentUser?.uid) return;

    try {
      await scheduleService.addTimeSlot(currentUser.uid, {
        day: newSlot.day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      });

      setModal(false);
      setNewSlot({
        day: DAYS_OF_WEEK[0],
        startTime: '',
        endTime: '',
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add time slot',
      );
    }
  };

  return (
    <View className="p-4 gap-y-4 flex-1">
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

      {slots.length !== 0 ? (
        <View className="flex-1">
          <FlatList
            data={slots}
            horizontal={false}
            keyExtractor={item => item.id}
            renderItem={renderSlotItem}
            contentContainerClassName="gap-y-2 drop-shadow-lg"
          />
        </View>
      ) : (
        <View className="flex-1">
          <Icon
            name="calendar-clear-outline"
            size={100}
            color="#ccc"
            className="self-center mt-20"
          />
          <Text className="text-center text-gray-500 mt-4">
            No time slots added yet.
          </Text>
        </View>
      )}

      <View className="">
        <TouchableOpacity
          className="p-4 bg-teal-100 rounded-lg flex-row items-center justify-center gap-x-2 w-full"
          onPress={() => setModal(true)}
        >
          <Icon name="add" size={20} color="#008080" />
          <Text className="text-teal-600 font-semibold text-lg">
            Add Time Slot
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="p-4 rounded-lg bg-teal-600 elevation-5"
        onPress={() => {}}
      >
        <Text className="text-center text-white font-bold text-lg">
          Save & Continue
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center mb-4">
              Add Time Slot
            </Text>

            <View className="flex-row mb-4">
              <View className="flex-1">
                <Text className="font-semibold mb-2">Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {timeOptions.map(time => (
                      <TouchableOpacity
                        key={time}
                        className={`px-3 py-2 rounded-lg mr-2 ${
                          newSlot.startTime === time
                            ? 'bg-teal-600'
                            : 'bg-gray-200'
                        }`}
                        onPress={() =>
                          setNewSlot(prev => {
                            if (prev.endTime && time >= prev.endTime) {
                              return { ...prev, startTime: time, endTime: '' };
                            }
                            return { ...prev, startTime: time };
                          })
                        }
                      >
                        <Text
                          className={`text-sm ${
                            newSlot.startTime === time
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
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
                  {timeOptions.map(time => (
                    <TouchableOpacity
                      key={time}
                      disabled={time <= newSlot.startTime}
                      className={`px-3 py-2 rounded-lg mr-2 ${
                        newSlot.endTime === time ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                      activeOpacity={time <= newSlot.startTime ? 1 : 0.7}
                      onPress={() => setNewSlot({ ...newSlot, endTime: time })}
                    >
                      <Text
                        className={`text-sm ${
                          newSlot.endTime === time
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Text className="text-center font-semibold mb-4">
              The date is{' '}
              {getDateOccurrence(newSlot.day).toLocaleDateString('en-GB')}
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={() => setModal(false)}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-teal-600 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={handleAddSlot}
              >
                <Text className="text-white text-center font-semibold">
                  Add Slot
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AvailabilityScreen;
