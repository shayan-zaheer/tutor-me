import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useResponsiveDesign, getScrollViewStyle } from '../../utils/responsive';
import firestore from "@react-native-firebase/firestore";
import { WEB_CLIENT_ID } from '@env';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const responsive = useResponsiveDesign();

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

    setIsLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      Alert.alert('Success', `Welcome back, ${userCredential.user.email}!`);
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

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

      let isNewUser = false;
      if (!docSnap.exists()) {
        await userRef.set({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          provider: 'google',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        isNewUser = true;
      } else {
        isNewUser = false;
      }

      Alert.alert(
        'Success',
        isNewUser 
          ? `Account created with Google!\n\nWelcome, ${userCredential.user.displayName}!`
          : `Welcome back, ${userCredential.user.displayName}!`,
        [
          {
            text: 'OK',
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Google Sign-Up Error', error.message || 'Google Sign-Up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={getScrollViewStyle(responsive.isLandscape, responsive.containerPadding)}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center" style={{ marginBottom: responsive.headerMargin }}>
          <Text
            className={`font-bold text-[#008080] mb-2 text-center ${responsive.fontSize['3xl']}`}
          >
            TutorMe
          </Text>
          <Text
            className={`text-gray-600 text-center font-bold ${responsive.fontSize.xl}`}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            Welcome Back
          </Text>
        </View>

        <View style={{ marginBottom: responsive.formMargin }}>
          <View className="mb-4">
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Email Address
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 text-black rounded-lg ${responsive.spacing.input}`}
              placeholder="Enter your email"
              placeholderTextColor="#000"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: responsive.formMargin }}>
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Password
            </Text>
            <View className="relative">
              <TextInput
                className={`bg-white border border-gray-300 rounded-lg text-black ${responsive.spacing.input}`}
                placeholder="Enter your password"
                placeholderTextColor="#000"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 mb-4 ${
              isLoading ? 'bg-gray-400' : 'bg-[#008080]'
            }`}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg text-center">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            <Text className="mx-4 text-gray-500 font-medium bg-blue-50 px-2">
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
          </View>

          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg py-4 mb-4 flex-row justify-center items-center"
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require('../../assets/google-logo.png')}
              style={{ width: 24, height: 24, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text className="text-gray-700 font-medium text-base">
              Sign In with Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-blue-600 font-medium">
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center mt-4">
          <Text className="text-gray-500 font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
