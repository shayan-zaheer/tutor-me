import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const DetailsScreen = ({ navigation }: any) => {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-purple-50">
      <Text className="text-purple-800 font-bold text-center text-4xl mb-6">Details Screen 📄</Text>
      
      <Text className="text-base text-center text-gray-600 mb-8">
        This is the details page. NativeWind is working here too!
      </Text>

      <TouchableOpacity 
        className="bg-purple-600 px-6 py-4 rounded-lg mb-4"
        onPress={() => navigation.goBack()}
      >
        <Text className='text-white font-semibold text-lg text-center'>
          ← Go Back to Home
        </Text>
      </TouchableOpacity>

      <View className='mt-6 p-4 bg-yellow-100 rounded-lg'>
        <Text className='text-yellow-700 font-medium text-center'>
          🎨 Purple theme with NativeWind!
        </Text>
      </View>
    </View>
  )
}

export default DetailsScreen;