import { Text, View, TextInput, Button } from 'react-native'
import React from 'react'

const ContactInfoScreen = () => {
  return (
    <View>

        <View className='flex-row justify-center items-center'>
            <View className="h-2 w-10 rounded-full bg-primary/30" />
            <View className="h-2 w-10 rounded-full bg-primary" />
            <View className="h-2 w-10 rounded-full bg-primary/30" />
            <View className="h-2 w-10 rounded-full bg-primary/30" />
        </View>

      <Text className='text-xl'>Contact Information</Text>
      <Text>Provide your contact details so students can reach you after a successful booking</Text>
      <Text>Phone Number</Text>
      <TextInput
        className='px-3 py-4 text-black'
        placeholder="Enter your phone number" 
        placeholderTextColor={"#B4BAC3"}
        keyboardType="phone-pad"
      />
      <Text>Preferred Communication Methods</Text>
      <TextInput 
        placeholder="Enter your preferred communication methods" 
        keyboardType="default"
      />
      <TextInput 
        placeholder="Enter your preferred communication methods" 
        keyboardType="default"
      />
      <TextInput 
        placeholder="Enter your preferred communication methods" 
        keyboardType="default"
      />
      <View className='p-4 bg-[#DFECF4]'>
        <Text>Your contact details will only be shared with a student after they have booked a session with you.</Text>
      </View>

      <Button
        title="Save"
        onPress={() => {}}
      />
    </View>
  )
}

export default ContactInfoScreen;