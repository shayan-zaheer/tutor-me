import { Alert } from 'react-native';
import firestore from "@react-native-firebase/firestore";
import { testLoginFields } from '../validation/userValidation';

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

const getAuthService = () => {
    return auth();
};

export { signInWithEmailAndPasswordService, signInWithGoogleService, getAuthService };