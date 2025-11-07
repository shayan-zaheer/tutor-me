import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../services/userService';
import AuthInput from '../../components/AuthInput';
const googleIcon = require('../../assets/google-logo.png');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAuth = async () => {
    await userService.signInWithEmailAndPassword(email, password, setIsLocalLoading);
  };

  const handleGoogleSignIn = async () => {
    await userService.signInWithGoogle(setIsGoogleLoading);
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView 
        behavior={'padding'}
        keyboardVerticalOffset={100}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 p-6"
          keyboardShouldPersistTaps="handled"
        >
        <View className="items-center mb-8">
          <Text className="font-bold text-[#008080] mb-2 text-center text-3xl">
            TutorMe
          </Text>
          <Text className="text-gray-600 text-center font-bold text-xl line-clamp-1">
            Welcome Back
          </Text>
        </View>

        <View className="mb-6">
          <View className="mb-4">
            <Text className="font-medium text-black mb-2 text-sm">
              Email Address
            </Text>
            <AuthInput 
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View className="mb-6">
            <Text className="font-medium text-black mb-2 text-sm">
              Password
            </Text>
              <AuthInput 
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 mb-4 ${
              isLocalLoading ? 'bg-gray-400' : 'bg-[#008080]'
            }`}
            onPress={handleAuth}
            disabled={isLocalLoading}
          >
            {isLocalLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg text-center">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 font-medium bg-blue-50 px-2">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg py-4 mb-4 flex-row justify-center items-center"
            onPress={handleGoogleSignIn}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <Image
                  source={googleIcon}
                  className="w-6 h-6 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-gray-700 font-medium text-base">
                  Sign In with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-blue-600 font-medium">
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
