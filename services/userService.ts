import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { testLoginFields } from '../validation/userValidation';
import { userRepository } from '../repos/userRepository';

const signInWithEmailAndPasswordService = async (email: string, password: string, setIsLocalLoading: (loading: boolean) => void) => {
    if (!testLoginFields(email, password)) {
        Alert.alert('Error', 'Please enter a valid email and password');
        return;
    }

    setIsLocalLoading(true);

    try {
      await userRepository.normalSignIn(email, password);
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
      await userRepository.googleSignIn();
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
        await userRepository.createUserWithEmailAndPassword(email, password, fullName);
    } catch (error: any) {
        Alert.alert('SignUp Error', error.message || 'Account creation failed');
    } finally {
        setIsLocalLoading(false);
    }
};

const signUpWithGoogleService = async (setIsGoogleLoading: (loading: boolean) => void) => {
    try {
      setIsGoogleLoading(true);
      await userRepository.googleSignIn();
    } catch (error: any) {
      Alert.alert('Google Sign-Up Error', error.message || 'Google Sign-Up failed');
    } finally {
      setIsGoogleLoading(false);
    }
};

const getAuthService = () => {
    return auth();
};

const updateUserContactInfo = async (userId: string, contact: string) => {
    try {
        await userRepository.updateUserProfile(userId, { contact });
    } catch (error) {
        console.error('Error updating contact info:', error);
        throw error;
    }
};

const getUserProfile = async (userId: string) => {
    try {
        const userDoc = await userRepository.getUserById(userId);
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

const getAllTutors = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firestore()
            .collection('users')
            .where('profile', '!=', null)
            .onSnapshot(
                (snapshot) => {
                    const data = snapshot.docs.map(doc => {
                        const docData = doc.data();
                        const profile = {
                            bio: docData?.profile?.bio ?? '',
                            speciality: docData?.profile?.speciality ?? '',
                            rating: docData?.profile?.rating ?? 0,
                            totalReviews: docData?.profile?.totalReviews ?? 0,
                            hourlyRate: docData?.profile?.hourlyRate ?? 0,
                        };

                        return {
                            id: doc.id,
                            name: docData?.name ?? 'Unknown',
                            profile,
                            createdAt: docData?.createdAt,
                            updatedAt: docData?.updatedAt,
                        };
                    });
                    resolve(data);
                },
                reject
            );
        return unsubscribe;
    });
};

const getTutorStats = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firestore()
            .collection('users')
            .where('profile', '!=', null)
            .onSnapshot(
                (snapshot) => {
                    const subjectsSet = new Set();
                    let totalRating = 0;

                    snapshot.docs.forEach(doc => {
                        const data = doc.data();
                        const speciality = data?.profile?.speciality || '';
                        subjectsSet.add(speciality);
                        totalRating += data?.profile?.rating || 0;
                    });

                    const stats = [
                        {
                            title: 'Total Tutors',
                            value: snapshot.size,
                            icon: 'people',
                            color: 'bg-blue-500',
                        },
                        {
                            title: 'Subjects',
                            value: subjectsSet.size,
                            icon: 'book',
                            color: 'bg-green-500',
                        },
                        {
                            title: 'Average Rating',
                            value: snapshot.size > 0 ? parseFloat((totalRating / snapshot.size).toFixed(1)) : 0,
                            icon: 'star',
                            color: 'bg-yellow-500',
                        },
                    ];
                    resolve(stats);
                },
                reject
            );
        return unsubscribe;
    });
};

const updateUserProfileService = async (userId: string, updates: any) => {
    try {
        await userRepository.updateUserProfile(userId, updates);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

const getUserProfileRealTime = (userId: string, callback: (profile: any) => void) => {
    try {
        const unsubscribe = firestore()
            .collection('users')
            .doc(userId)
            .onSnapshot(
                (doc) => {
                    if (doc.exists()) {
                        callback(doc.data());
                    } else {
                        callback(null);
                    }
                },
                (error) => {
                    console.error('Error listening to user profile:', error);
                    callback(null);
                }
            );
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up user profile listener:', error);
        return () => {};
    }
};

export const userService = {
    signInWithEmailAndPassword: signInWithEmailAndPasswordService,
    signInWithGoogle: signInWithGoogleService,
    signUpWithEmailAndPassword: signUpWithEmailAndPasswordService,
    signUpWithGoogle: signUpWithGoogleService,
    getAuth: getAuthService,
    updateUserContactInfo,
    updateUserProfile: updateUserProfileService,
    getUserProfile,
    getUserProfileRealTime,
    getAllTutors,
    getTutorStats,
};