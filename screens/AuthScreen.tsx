import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '939229191665-8698m0f3adb35i8ujrt7kci73v3ebe1r.apps.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

// Debug Firebase initialization
console.log('🔥 Firebase Auth initialized:', !!auth);
console.log('🔥 Firebase App name:', auth().app.name);
console.log('🔥 Firebase Auth current user:', auth().currentUser);

const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const isSmallScreen = width < 375;
  const isLargeScreen = width >= 414;
  const isLandscape = width > height;

  const containerPadding = isSmallScreen ? 16 : isLargeScreen ? 32 : 24;
  const headerMargin = isSmallScreen ? 24 : 32;
  const formMargin = isSmallScreen ? 16 : 24;

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

    // Debug logging
    console.log('🔥 Firebase Auth Debug:');
    console.log('- Email:', email.trim());
    console.log('- Password length:', password.length);
    console.log('- Is Login:', isLogin);
    console.log('- Firebase Auth instance:', auth());

    try {
      if (isLogin) {
        console.log('🔐 Attempting Firebase signInWithEmailAndPassword...');
        const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
        console.log('✅ User logged in successfully:', userCredential.user);
        Alert.alert('Success', `Welcome back, ${userCredential.user.email}!`);
        // Navigate to Home screen after successful login
        // navigation.replace('Home');
      } else {
        const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
        console.log('User created successfully:', userCredential.user);
        Alert.alert('Success', `Account created successfully for ${userCredential.user.email}!`);
        // Navigate to Home screen after successful signup
        // navigation.replace('Home');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      let errorMessage = 'Authentication failed';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = isLogin 
            ? 'Invalid email or password. Please check your credentials and try again.' 
            : 'Invalid credentials provided. Please try again.';
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
      
      console.log('🔍 Google Sign-In Debug:');
      console.log('- Starting Google Sign-In process...');
      
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
      console.log('- Signing in with Firebase...');
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Google Sign-In successful:', userCredential.user.email);
      Alert.alert('Success', `Signed in with Google as ${userCredential.user.email}!`);
      
      // Navigate to Home screen after successful login
      // navigation.replace('Home');
      
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      console.error('- Error code:', error.code);
      console.error('- Error message:', error.message);
      
      let errorMessage = 'Google Sign-In failed';
      
      // Handle specific Google Sign-In error codes
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
          // Check if it's a developer error
          if (error.message?.includes('DEVELOPER_ERROR')) {
            errorMessage = 'Configuration error: Please check SHA1 fingerprint in Firebase Console\n\nYour SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';
          } else {
            errorMessage = error.message || 'Google Sign-In failed';
          }
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
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: isLandscape ? 'flex-start' : 'center',
          padding: containerPadding,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center" style={{ marginBottom: headerMargin }}>
          <Text
            className={`font-bold text-[#008080] mb-2 text-center ${
              isSmallScreen
                ? 'text-3xl'
                : isLargeScreen
                ? 'text-4xl'
                : 'text-3xl'
            }`}
          >
            {isLogin ? 'TutorMe' : 'Create Account 🚀'}
          </Text>
          <Text
            className={`text-gray-600 text-center font-bold ${
              isSmallScreen
                ? 'text-3xl'
                : isLargeScreen
                ? 'text-2xl'
                : 'text-xl'
            }`}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {isLogin ? 'Welcome Back' : 'Join us today'}
          </Text>
        </View>

        <View style={{ marginBottom: formMargin }}>
          <View className="mb-4">
            <Text
              className={`font-medium text-black mb-2 ${
                isSmallScreen ? 'text-xs' : 'text-sm'
              }`}
            >
              Email Address
            </Text>
            <TextInput
              className={`bg-white border border-gray-300 text-black rounded-lg ${
                isSmallScreen
                  ? 'p-3 text-sm'
                  : isLargeScreen
                  ? 'px-5 py-4 text-lg'
                  : 'px-4 py-3 text-base'
              }`}
              placeholder="Enter your email"
              placeholderTextColor="#000"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: formMargin }}>
            <Text
              className={`font-medium text-black mb-2 ${
                isSmallScreen ? 'text-xs' : 'text-sm'
              }`}
            >
              Password
            </Text>
            <View className="relative">
              <TextInput
                className={`bg-white border border-gray-300 rounded-lg text-black ${
                  isSmallScreen
                    ? 'p-3 text-sm'
                    : isLargeScreen
                    ? 'px-5 py-4 text-lg'
                    : 'px-4 py-3 text-base'
                }`}
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
                {isLogin ? 'Sign In' : 'Sign Up'}
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
              source={require('../assets/google-logo.png')}
              style={{ width: 24, height: 24, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text className="text-gray-700 font-medium text-base">
              Sign In with Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-blue-600 font-medium">
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLogin && (
          <TouchableOpacity className="items-center mt-4">
            <Text className="text-gray-500 font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
