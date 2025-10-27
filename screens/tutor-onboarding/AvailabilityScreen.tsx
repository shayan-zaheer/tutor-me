import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getDateOccurrence } from '../../utils/getDateOccurrence';

const AvailabilityScreen = () => {
  const [showModal, setModal] = useState<boolean>(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    price: '',
  });
  const [slots, setSlots] = useState<Array<any>>([]);
  const currentUser = auth().currentUser;

  const deleteSlot = async (scheduleId: string, slotToDelete: any) => {
    try {
      const tutorRef = firestore().collection('users').doc(currentUser?.uid);
      const snapshot = await firestore()
        .collection('schedules')
        .where('tutorId', '==', tutorRef)
        .get();

      for (const doc of snapshot.docs) {
        const schedule = doc.data();
        const receivedSlots = schedule.slots || [];

        const updatedSlots = receivedSlots.filter((slot: any) => {
          const start = slot.startTime.toDate().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const end = slot.endTime.toDate().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const time = `${start} - ${end}`;
          const day = slot.startTime
            .toDate()
            .toLocaleDateString('en-GB', { weekday: 'long' });

          return !(time === slotToDelete.time && day === slotToDelete.day);
        });

        if (updatedSlots.length !== receivedSlots.length) {
          await firestore().collection('schedules').doc(doc.id).update({
            slots: updatedSlots,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const tutorRef = firestore().collection('users').doc(currentUser.uid);

    const unsubscribe = firestore()
      .collection('schedules')
      .where('tutorId', '==', tutorRef)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const refined = data.flatMap((schedule: any) =>
          schedule.slots?.map((slot: any) => ({
            id: uuidv4(),
            time: `${slot.startTime.toDate().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${slot.endTime.toDate().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            day: slot.startTime
              .toDate()
              .toLocaleDateString('en-GB', { weekday: 'long' }),
            difference: `${
              +slot.endTime.toDate().getHours() -
              +slot.startTime.toDate().getHours()
            } hours`,
          })),
        );

        setSlots(refined);
      });

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
      <TouchableOpacity onPress={() => deleteSlot(item.id, item)}>
        <Icon name="trash" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderDays = ({ item }: { item: string }) => (
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

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

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
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.price) return;

    const targetDate = getDateOccurrence(newSlot.day);

    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);

    const [startHour, startMinute] = newSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = newSlot.endTime.split(':').map(Number);

    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    const tutorRef = firestore().collection('users').doc(currentUser?.uid);

    const snapshot = await firestore()
      .collection('schedules')
      .where('tutorId', '==', tutorRef)
      .get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const hasConflict = schedules.some((schedule: any) =>
      schedule.slots?.some((slot: any) => {
        const existingStart = slot.startTime.toDate();
        const existingEnd = slot.endTime.toDate();

        return (
          (startDate >= existingStart && startDate < existingEnd) ||
          (endDate > existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        );
      }),
    );

    if (hasConflict) {
      Alert.alert(
        'Time Conflict',
        'This time slot overlaps with an existing schedule.',
      );
      return;
    }

    const existingSchedule = schedules.find(
      (schedule: any) =>
        schedule.tutorId.isEqual && schedule.tutorId.isEqual(tutorRef),
    );

    const newSlotData = {
      startTime: firestore.Timestamp.fromDate(startDate),
      endTime: firestore.Timestamp.fromDate(endDate),
      price: +newSlot.price,
    };

    if (existingSchedule) {
      await firestore()
        .collection('schedules')
        .doc(existingSchedule.id)
        .update({
          slots: firestore.FieldValue.arrayUnion(newSlotData),
        });
    } else {
      await firestore()
        .collection('schedules')
        .add({
          slots: [newSlotData],
          tutorId: tutorRef,
        });
    }

    setModal(false);

    setNewSlot({
      day: 'Monday',
      startTime: '',
      endTime: '',
      price: '',
    });
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

            <View className="mb-6">
              <Text className="font-semibold mb-2">Price (PKR)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-black"
                placeholder="e.g., 30"
                placeholderTextColor="#666"
                value={newSlot.price}
                onChangeText={text => setNewSlot({ ...newSlot, price: text })}
                keyboardType="numeric"
              />
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
