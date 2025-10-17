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
import { WEB_CLIENT_ID } from '@env';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

const SignUpScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const responsive = useResponsiveDesign();

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
      
      await userCredential.user.updateProfile({
        displayName: fullName.trim(),
      });

      console.log('✅ User created successfully:', userCredential.user.email);
      Alert.alert(
        'Success', 
        `Account created successfully for ${userCredential.user.email}!\n\nWelcome, ${fullName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will happen automatically when auth state changes
              console.log('User created, auth state will change automatically');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('SignUp error:', error);
      let errorMessage = 'Account creation failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Account creation failed';
      }
      
      Alert.alert('SignUp Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Google Sign-Up Debug:');
      console.log('- Starting Google Sign-Up process...');
      
      // Check if device has Google Play Services
      console.log('- Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Google Play Services available');

      // Sign out any existing Google session first
      console.log('- Signing out existing session...');
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
      
      // Sign-in the user with the credential
      console.log('- Signing up with Firebase...');
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Google Sign-Up successful:', userCredential.user.email);
      Alert.alert(
        'Success', 
        `Account created with Google!\n\nWelcome, ${userCredential.user.displayName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will happen automatically when auth state changes
              console.log('Google signup successful, auth state will change automatically');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Google Sign-Up error:', error);
      console.error('- Error code:', error.code);
      console.error('- Error message:', error.message);
      
      let errorMessage = 'Google Sign-Up failed';
      
      // Handle specific Google Sign-In error codes
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = 'Sign-up was cancelled by user';
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = 'Sign-up is already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = 'Google Play Services not available or outdated';
          break;
        case statusCodes.SIGN_IN_REQUIRED:
          errorMessage = 'Sign-up is required';
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
        default:
          // Check if it's a developer error
          if (error.message?.includes('DEVELOPER_ERROR')) {
            errorMessage = 'Configuration error: Please check SHA1 fingerprint in Firebase Console\n\nYour SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';
          } else {
            errorMessage = error.message || 'Google Sign-Up failed';
          }
      }
      
      Alert.alert('Google Sign-Up Error', errorMessage);
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
            Join TutorMe 🚀
          </Text>
          <Text
            className={`text-gray-600 text-center font-bold ${responsive.fontSize.xl}`}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            Create your account today
          </Text>
        </View>

        <View style={{ marginBottom: responsive.formMargin }}>
          {/* Full Name Input */}
          <View className="mb-4">
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Full Name
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 text-black rounded-lg ${responsive.spacing.input}`}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Email Address
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 text-black rounded-lg ${responsive.spacing.input}`}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Password
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 rounded-lg text-black ${responsive.spacing.input}`}
              placeholder="Create a password (min 6 characters)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: responsive.formMargin }}>
            <Text
              className={`font-medium text-black mb-2 ${responsive.fontSize.xs}`}
            >
              Confirm Password
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 rounded-lg text-black ${responsive.spacing.input}`}
              placeholder="Confirm your password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 mb-4 ${
              isLoading ? 'bg-gray-400' : 'bg-[#008080]'
            }`}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg text-center">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            <Text className="mx-4 text-gray-500 font-medium bg-blue-50 px-2">
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-lg py-4 mb-4 flex-row justify-center items-center"
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          >
            <Image
              source={require('../../assets/google-logo.png')}
              style={{ width: 24, height: 24, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text className="text-gray-700 font-medium text-base">
              Sign Up with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation to Login */}
        <View className="items-center">
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-600 font-medium">
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy Notice */}
        <View className="items-center mt-6">
          <Text className="text-gray-500 text-xs text-center px-4">
            By creating an account, you agree to our{'\n'}
            <Text className="text-blue-600">Terms of Service</Text> and{' '}
            <Text className="text-blue-600">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
