import firestore from '@react-native-firebase/firestore';
import { bookingRepository } from '../repos/bookingRepository';
import { userRepository } from '../repos/userRepository';
import { populateReferences } from '../utils/populateReferences';
import { timestampToDate } from '../utils/dateUtil';
import { checkTimeConflict } from '../utils/checkTimeConflict';

export const bookingService = {
  getStudentBookings: (userId: string) => {
    const firestoreStudentReference = firestore().collection('users').doc(userId);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = bookingRepository
        .getBookingsByStudentId(firestoreStudentReference)
        .onSnapshot(
          async (snapshot) => {
            try {
              const populatedBookings = await Promise.all(
                snapshot.docs.map(async (doc) => {
                  const populated = await populateReferences(doc.data());
                  return { id: doc.id, ...populated };
                })
              );
              resolve(populatedBookings);
            } catch (err) {
              reject(err);
            }
          },
          reject
        );
      
      return unsubscribe;
    });
  },

  getStudentBookingsRealTime: (userId: string, callback: (bookings: any[]) => void) => {
    const firestoreStudentReference = firestore().collection('users').doc(userId);
    let populatedBookingsCache: { [key: string]: any } = {};
    
    return bookingRepository
      .getBookingsByStudentId(firestoreStudentReference)
      .onSnapshot(
        async (snapshot) => {
          try {
            const bookingsToPopulate: any[] = [];
            const currentBookings: any[] = [];

            snapshot.docs.forEach((doc) => {
              const bookingData = { id: doc.id, ...doc.data() };
              const cached = populatedBookingsCache[doc.id];
              
              if (!cached || 
                  (cached as any)?.rating !== (bookingData as any)?.rating || 
                  (cached as any)?.review !== (bookingData as any)?.review) {
                bookingsToPopulate.push(bookingData);
              } else {
                currentBookings.push(cached);
              }
            });

            if (bookingsToPopulate.length > 0) {
              const newPopulatedBookings = await Promise.all(
                bookingsToPopulate.map(async (booking) => {
                  const populated = await populateReferences(booking);
                  populatedBookingsCache[booking.id] = populated;
                  return populated;
                })
              );
              currentBookings.push(...newPopulatedBookings);
            }

            const currentBookingIds = snapshot.docs.map(doc => doc.id);
            Object.keys(populatedBookingsCache).forEach(cachedId => {
              if (!currentBookingIds.includes(cachedId)) {
                delete populatedBookingsCache[cachedId];
              }
            });

            callback(currentBookings);
          } catch (err) {
            console.error('Error in real-time bookings listener:', err);
            callback([]);
          }
        },
        (error) => {
          console.error('Bookings listener error:', error);
          callback([]);
        }
      );
  },

  getTutorBookings: (userId: string) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = bookingRepository
        .getBookingsByTutorId(firestoreTutorReference)
        .onSnapshot(
          async (snapshot) => {
            try {
              const populatedBookings = await Promise.all(
                snapshot.docs.map(async (doc) => {
                  const populated = await populateReferences(doc.data());
                  return { id: doc.id, ...populated };
                })
              );
              resolve(populatedBookings);
            } catch (err) {
              reject(err);
            }
          },
          reject
        );
      
      return unsubscribe;
    });
  },

  createBooking: async (bookingData: {
    tutorId: string;
    studentId: string;
    scheduleId: string;
    slot: any;
    price: number;
  }) => {
    const firestoreTutorReference = firestore().collection('users').doc(bookingData.tutorId);
    const firestoreStudentReference = firestore().collection('users').doc(bookingData.studentId);
    const scheduleRef = firestore().collection('schedules').doc(bookingData.scheduleId);

    const bookingPayload = {
      tutor: firestoreTutorReference,
      student: firestoreStudentReference,
      schedule: scheduleRef,
      bookedSlot: {
        startTime: bookingData.slot.startTime,
        endTime: bookingData.slot.endTime,
        price: bookingData.price,
      },
      ratings: 0,
      isPaid: true,
      review: '',
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    return await bookingRepository.createBooking(bookingPayload as any);
  },

  deleteBooking: async (bookingId: string) => {
    return await bookingRepository.deleteBooking(bookingId);
  },

  submitRating: async (bookingId: string, rating: number, review: string, tutorId: string) => {
    const [, tutorDoc] = await Promise.all([
      bookingRepository.updateBookingRating(bookingId, rating, review),
      userRepository.getUserById(tutorId)
    ]);
    
    if (tutorDoc.exists()) {
      const tutorData = tutorDoc.data();
      const currentRating = tutorData?.profile?.ratings || 0;
      const currentTotalReviews = tutorData?.profile?.totalReviews || 0;

      const newTotalReviews = currentTotalReviews + 1;
      const newAverageRating = ((currentRating * currentTotalReviews) + rating) / newTotalReviews;

      await userRepository.updateUserProfile(tutorId, {
        'profile.rating': newAverageRating,
        'profile.totalReviews': firestore.FieldValue.increment(1),
      });
    }
  },

  checkStudentBookingConflict: async (studentId: string, startTime: any, endTime: any) => {
    const firestoreStudentReference = firestore().collection('users').doc(studentId);
    const studentBookingsSnapshot = await bookingRepository
      .getBookingsByStudentId(firestoreStudentReference)
      .get();

    return studentBookingsSnapshot.docs.some(doc => {
      const booking = doc.data();
      if (booking.bookedSlot) {
        const existingStart = timestampToDate(booking.bookedSlot.startTime);
        const existingEnd = timestampToDate(booking.bookedSlot.endTime);
        const newStart = timestampToDate(startTime);
        const newEnd = timestampToDate(endTime);

        return checkTimeConflict(existingStart, existingEnd, newStart, newEnd);
      }
      return false;
    });
  },

  checkTeachingConflict: async (studentId: string, startTime: any, endTime: any) => {
    const firestoreStudentReference = firestore().collection('users').doc(studentId);
    const { scheduleRepository } = await import('../repos/scheduleRepository');
    
    const studentSchedulesSnapshot = await scheduleRepository
      .getSchedulesByTutorId(firestoreStudentReference)
      .get();

    return studentSchedulesSnapshot.docs.some(doc => {
      const schedule = doc.data();
      if (schedule.slots) {
        return schedule.slots.some((slot: any) => {
          const existingStart = timestampToDate(slot.startTime);
          const existingEnd = timestampToDate(slot.endTime);
          const newStart = timestampToDate(startTime);
          const newEnd = timestampToDate(endTime);

          return checkTimeConflict(existingStart, existingEnd, newStart, newEnd);
        });
      }
      return false;
    });
  },

  markBookingComplete: async (bookingId: string) => {
    return await bookingRepository.updateBooking(bookingId, {
      status: 'completed'
    } as any);
  },
};
