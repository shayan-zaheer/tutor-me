import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
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
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    setIsLocalLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password,
      );

      const user = userCredential.user;
      const userRef = firestore().collection('users').doc(user.uid);
      const docSnap = await userRef.get();

      if (!docSnap.exists()) {
        await userRef.set({
          id: user.uid,
          email: user.email,
          name: fullName.trim(),
          provider: 'email',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error: any) {
      Alert.alert('SignUp Error', error.message || 'Account creation failed');
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      Alert.alert(
        'Google Sign-Up Error',
        error.message || 'Google Sign-Up failed',
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
            <TextInput
              className="bg-white border border-gray-300 text-black rounded-lg px-4 py-3"
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium text-black mb-2 text-sm">
              Email Address
            </Text>
            <TextInput
              className="bg-white border border-gray-300 text-black rounded-lg px-4 py-3"
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium text-black mb-2 text-sm">
              Password
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg text-black px-4 py-3"
              placeholder="Create a password (min 6 characters)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="font-medium text-black mb-2 text-sm">
              Confirm Password
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg text-black px-4 py-3"
              placeholder="Confirm your password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
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
