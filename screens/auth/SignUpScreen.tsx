import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useState } from 'react';
import { userService } from '../../services/userService';
import AuthInput from '../../components/AuthInput';
const googleIcon = require('../../assets/google-logo.png');

const SignUpScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    await userService.signUpWithEmailAndPassword(
      email,
      password,
      confirmPassword,
      fullName,
      setIsLocalLoading
    );
  };

  const handleGoogleSignUp = async () => {
    await userService.signUpWithGoogle(setIsGoogleLoading);
  };

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      keyboardVerticalOffset={100}
      className="flex-1 bg-blue-50"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        horizontal={false}
        className="py-8 px-6 flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <Text className="font-bold text-[#008080] mb-2 text-center text-3xl">
            Join TutorMe
          </Text>
          <Text className="text-gray-600 text-center font-bold text-xl">
            Create your account today
          </Text>
        </View>

        <View className="mb-6">
          <View className="mb-4">
            <Text className="font-medium text-black mb-2 text-sm">
              Full Name
            </Text>
            <AuthInput
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

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

          <View className="mb-4">
            <Text className="font-medium text-black mb-2 text-sm">
              Password
            </Text>
            <AuthInput
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-6">
            <Text className="font-medium text-black mb-2 text-sm">
              Confirm Password
            </Text>
            <AuthInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 mb-4 ${
              isLocalLoading ? 'bg-gray-400' : 'bg-[#008080]'
            }`}
            onPress={handleSignUp}
            disabled={isLocalLoading}
          >
            {isLocalLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg text-center">
                Create Account
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
            onPress={handleGoogleSignUp}
            disabled={isGoogleLoading}
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
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-600 font-medium">
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
