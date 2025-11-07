import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Booking } from '../types';

export const bookingRepository = {
  getBookingsByStudentId: (studentRef: FirebaseFirestoreTypes.DocumentReference) => {
    return firestore()
      .collection('bookings')
      .where('student', '==', studentRef);
  },

  getBookingsByTutorId: (tutorRef: FirebaseFirestoreTypes.DocumentReference) => {
    return firestore()
      .collection('bookings')
      .where('tutor', '==', tutorRef);
  },

  getAllBookings: () => {
    return firestore().collection('bookings');
  },

  createBooking: async (bookingData: Omit<Booking, 'id'>) => {
    return await firestore().collection('bookings').add({
      ...bookingData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  updateBooking: async (bookingId: string, updates: Partial<Booking>) => {
    return await firestore()
      .collection('bookings')
      .doc(bookingId)
      .update(updates);
  },

  deleteBooking: async (bookingId: string) => {
    return await firestore().collection('bookings').doc(bookingId).delete();
  },

  getBookingById: async (bookingId: string) => {
    return await firestore().collection('bookings').doc(bookingId).get();
  },

  updateBookingRating: async (bookingId: string, rating: number, review: string) => {
    return await firestore()
      .collection('bookings')
      .doc(bookingId)
      .update({
        ratings: rating,
        review: review,
      });
  },
};