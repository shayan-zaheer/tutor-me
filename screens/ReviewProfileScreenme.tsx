import { Button, Text, View } from 'react-native'
import React from 'react'

const ReviewProfileScreen = () => {
  return (
    <View>
      
        <View className='flex-row justify-center'>
            <View className='flex-col justify-center items-center'>
                <View className='flex-row justify-between items-center'>
                    <Text>Subjects & Expertise</Text>
                    <Text className='text-blue-500'>Edit</Text>
                </View>
                <View>
                    <Text className="font-bold">Mathematics: </Text>
                    <Text>Advanced Calculus, Algebra</Text>
                    <Text className="font-bold">Physics: </Text>
                    <Text>Quantum Mechanics, Thermodynamics</Text>
                </View>
            </View>
        </View>
      
        <View className='flex-row justify-center'>
            <View className='flex-col justify-center items-center'>
                <View className='flex-row justify-between items-center'>
                    <Text>Availability</Text>
                    <Text className='text-blue-500'>Edit</Text>
                </View>
                <Text>Mon, Wed, Fri - 4:00 PM to 7:00 PM</Text>
            </View>
        </View>
      
        <View className='flex-row justify-center'>
            <View className='flex-col justify-center items-center'>
                <View className='flex-row justify-between items-center'>
                    <Text>Contact Details</Text>
                    <Text className='text-blue-500'>Edit</Text>
                </View>
                <View>
                    <Text className="font-bold">Email: </Text>
                    <Text>john.doe@example.com</Text>
                    <Text className="font-bold">Phone: </Text>
                    <Text>(123) 456-7890</Text>
                </View>
            </View>
        </View>

        <Button
          title="Confirm & Activate Profile"
          onPress={() => {}}
          color="#1193D4"
        />
    </View>
  )
}

export default ReviewProfileScreen;