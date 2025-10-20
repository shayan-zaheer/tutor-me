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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useResponsiveDesign, getScrollViewStyle } from '../../utils/responsive';
import { createOrUpdateUser } from '../../utils/userService';
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
      console.log('🔐 Attempting Firebase signInWithEmailAndPassword...');
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      console.log('✅ User logged in successfully:', userCredential.user);
      try {
        await createOrUpdateUser(userCredential.user);
      } catch (err) {
        console.error('Failed to create/update user document after login:', err);
      }
      Alert.alert('Success', `Welcome back, ${userCredential.user.email}!`);
      // Navigation will happen automatically when auth state changes
    } catch (error: any) {
      console.error('Authentication error:', error);
      let errorMessage = 'Authentication failed';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operation not allowed';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message || 'Authentication failed';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      await GoogleSignin.signOut();
      
  console.log('- Attempting Google Sign-In...');
      const signInResult = await GoogleSignin.signIn();
      console.log('- Google Sign-In result:', signInResult);
      
      const idToken = signInResult.data?.idToken;
      console.log('- ID Token received:', !!idToken);
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }
      
      console.log('- Creating Firebase credential...');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(googleCredential);
      // create/update user in Firestore
      try {
        await createOrUpdateUser(userCredential.user);
      } catch (err) {
        console.error('Failed to create/update user document after Google sign-in:', err);
      }
      
      console.log('✅ Google Sign-In successful:', userCredential.user.email);
      Alert.alert('Success', `Signed in with Google as ${userCredential.user.email}!`);
      
      // Navigate to Home screen after successful login
      // navigation.replace('Home');
      
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      console.error('- Error code:', error.code);
      console.error('- Error message:', error.message);
      
      let errorMessage = 'Google Sign-In failed';
      
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = 'Sign-in was cancelled by user';
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = 'Sign-in is already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = 'Google Play Services not available or outdated';
          break;
        case statusCodes.SIGN_IN_REQUIRED:
          errorMessage = 'Sign-in is required';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email address but different sign-in credentials';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'The credential is invalid or has expired';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google Sign-In is not enabled in Firebase Console';
          break;
        case 'auth/user-disabled':
          errorMessage = 'The user account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this credential';
          break;
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code';
          break;
        case 'auth/invalid-verification-id':
          errorMessage = 'Invalid verification ID';
          break;
        default:
          errorMessage = error.message || 'Google Sign-In failed';
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
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
