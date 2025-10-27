import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from "@react-native-firebase/firestore";
import { WEB_CLIENT_ID } from '@env';
import AuthInput from '../../components/AuthInput';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLocalLoading(true);

    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      await GoogleSignin.signOut();

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const user = userCredential.user;
      const userRef = firestore().collection('users').doc(user.uid);
      const docSnap = await userRef.get();

      if (!docSnap.exists()) {
        await userRef.set({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          provider: 'google',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error: any) {
      Alert.alert('Google Sign-Up Error', error.message || 'Google Sign-Up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image
                  source={require('../../assets/google-logo.png')}
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
