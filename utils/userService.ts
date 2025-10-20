import firestore from '@react-native-firebase/firestore';

export const createOrUpdateUser = async (user: any, additionalData: Record<string, any> = {}) => {
  if (!user || !user.uid) return null;

  try {
    const docRef = firestore().collection('users').doc(user.uid);

    const payload: Record<string, any> = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || additionalData.displayName || null,
      photoURL: user.photoURL || null,
      role: additionalData.role || 'student',
      lastLoginAt: firestore.FieldValue.serverTimestamp(),
      ...additionalData,
    };

    // Ensure createdAt exists if new doc
    await docRef.set({ createdAt: firestore.FieldValue.serverTimestamp(), ...payload }, { merge: true });

    return payload;
  } catch (err) {
    console.error('createOrUpdateUser error:', err);
    throw err;
  }
};
