import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const HomeScreen = ({ navigation }: any) => {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-black">
      <Text className='text-3xl font-bold text-center text-blue-700 mb-6'>Welcome to Home!🏠</Text>
      
      <Text className='text-base text-center text-gray-600 mb-8'>
        This is your main screen with NativeWind styling working!
      </Text>

      <TouchableOpacity 
        className="bg-blue-600 px-6 py-4 rounded-lg mb-4"
        onPress={() => navigation.navigate('Details')}
      >
        <Text className='text-white font-semibold text-lg text-center'>
          Go to Details Screen →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-green-600 px-6 py-4 rounded-lg mb-4"
        onPress={() => navigation.navigate('Auth')}
      >
        <Text className='text-white font-semibold text-lg text-center'>
          🔐 Go to Auth Screen
        </Text>
      </TouchableOpacity>

      <View className='mt-6 p-4 bg-green-100 rounded-lg'>
        <Text className='text-green-700 font-medium text-center'>
          ✅ Navigation is working!
        </Text>
      </View>
    </View>
  )
}

export default HomeScreen;