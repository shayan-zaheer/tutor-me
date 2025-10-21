import { Text, TouchableOpacity, View } from 'react-native'
import {useState} from 'react'
import Icon from 'react-native-vector-icons/Ionicons';

const ReviewProfileScreen = () => {
  return (
    <View className='p-4 gap-y-4'>
      <Text className="text-xl font-bold">Review Your Profile</Text>
        <View className='flex-row items-center justify-between rounded-lg bg-white p-4'>
            <View className="flex-row items-center flex-1">
                <View className='p-3 rounded-lg bg-[#CFE9F6] items-center justify-center'>
                    <Icon name="school-outline" size={20} color="#1193D4" />
                </View>
                <View className='ml-3 gap-y-2 flex-1'>
                    <Text className='text-lg'>Subjects & Expertise</Text>
                    <Text className='text-gray-500'>Mathematics: Advanced Calculus, Algebra</Text>
                </View>
            </View>
            <View className="flex-row items-center">
                <Icon name="pencil" size={15} color="#1193D4" />
                <Text className='ml-2 text-blue-500'>Edit</Text>
            </View>
        </View>
        <View className='flex-row items-center justify-between rounded-lg bg-white p-4'>
            <View className='p-3 rounded-lg bg-[#CFE9F6] items-center justify-center'>
                <Icon name="calendar-outline" size={20} color="#1193D4" />
            </View>
            <View className="flex-row items-center">
                <Icon name="pencil" size={15} color="#1193D4" />
                <Text className='ml-2 text-blue-500'>Edit</Text>
            </View>
        </View>
        <View className='flex-row items-center justify-between rounded-lg bg-white p-4'>
            <View className='p-3 rounded-lg bg-[#CFE9F6] items-center justify-center'>
                <Icon name="person-outline" size={20} color="#1193D4" />
            </View>
            <View className="flex-row items-center">
                <Icon name="pencil" size={15} color="#1193D4" />
                <Text className='ml-2 text-blue-500'>Edit</Text>
            </View>
        </View>

        <TouchableOpacity className='bg-[#1193D4] rounded-lg p-4'>
            <Text className="text-lg font-bold text-white text-center">Confirm & Activate Profile</Text>
        </TouchableOpacity>
    </View>
  )
}

export default ReviewProfileScreen;