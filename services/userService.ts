import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { testLoginFields } from '../validation/userValidation';
import { normalSignInRepository, googleSignInRepository, createUserWithEmailAndPasswordRepository } from '../repos/userRepository';

const signInWithEmailAndPasswordService = async (email: string, password: string, setIsLocalLoading: (loading: boolean) => void) => {
    if (!testLoginFields(email, password)) {
        Alert.alert('Error', 'Please enter a valid email and password');
        return;
    }

    setIsLocalLoading(true);

    try {
      await normalSignInRepository(email, password);
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLocalLoading(false);
    }
};

const signInWithGoogleService = async (setIsGoogleLoading: (loading: boolean) => void) => {
    try {
      setIsGoogleLoading(true);
      await googleSignInRepository();
    } catch (error: any) {
      Alert.alert('Google Sign-Up Error', error.message || 'Google Sign-Up failed');
    } finally {
      setIsGoogleLoading(false);
    }
};

const signUpWithEmailAndPasswordService = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    fullName: string, 
    setIsLocalLoading: (loading: boolean) => void
) => {
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
        await createUserWithEmailAndPasswordRepository(email, password, fullName);
    } catch (error: any) {
        Alert.alert('SignUp Error', error.message || 'Account creation failed');
    } finally {
        setIsLocalLoading(false);
    }
};

const signUpWithGoogleService = async (setIsGoogleLoading: (loading: boolean) => void) => {
    try {
      setIsGoogleLoading(true);
      await googleSignInRepository();
    } catch (error: any) {
      Alert.alert('Google Sign-Up Error', error.message || 'Google Sign-Up failed');
    } finally {
      setIsGoogleLoading(false);
    }
};

const getAuthService = () => {
    return auth();
};

export { 
    signInWithEmailAndPasswordService, 
    signInWithGoogleService, 
    signUpWithEmailAndPasswordService,
    signUpWithGoogleService,
    getAuthService 
};