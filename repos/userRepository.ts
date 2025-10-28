import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID } from '@env';
import firestore from "@react-native-firebase/firestore";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

const normalSignInRepository = async (email: string, password: string) => {
    return await auth().signInWithEmailAndPassword(email.trim(), password);
}

const googleSignInRepository = async () => {
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
      const firestoreUserReference = firestore().collection('users').doc(user.uid);
      const docSnap = await firestoreUserReference.get();

      if (!docSnap.exists()) {
        await firestoreUserReference.set({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          provider: 'google',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
}

export { normalSignInRepository, googleSignInRepository };