import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Slot } from '../types';

export const scheduleRepository = {
  getSchedulesByTutorId: (tutorRef: FirebaseFirestoreTypes.DocumentReference) => {
    return firestore()
      .collection('schedules')
      .where('tutorId', '==', tutorRef);
  },

  getSchedulesExcludingTutor: (tutorRef: FirebaseFirestoreTypes.DocumentReference) => {
    return firestore()
      .collection('schedules')
      .where('tutorId', '!=', tutorRef);
  },

  createSchedule: async (scheduleData: { 
    slots: Slot[], 
    tutorId: FirebaseFirestoreTypes.DocumentReference 
  }) => {
    return await firestore().collection('schedules').add(scheduleData);
  },

  updateScheduleSlots: async (scheduleId: string, slots: Slot[]) => {
    return await firestore()
      .collection('schedules')
      .doc(scheduleId)
      .update({ slots });
  },

  addSlotToSchedule: async (scheduleId: string, slot: Slot) => {
    return await firestore()
      .collection('schedules')
      .doc(scheduleId)
      .update({
        slots: firestore.FieldValue.arrayUnion(slot),
      });
  },

  getScheduleById: async (scheduleId: string) => {
    return await firestore().collection('schedules').doc(scheduleId).get();
  },

  deleteSchedule: async (scheduleId: string) => {
    return await firestore().collection('schedules').doc(scheduleId).delete();
  },
};