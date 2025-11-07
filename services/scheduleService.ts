import firestore from '@react-native-firebase/firestore';
import { scheduleRepository } from '../repos/scheduleRepository';
import { populateReferences } from '../utils/populateReferences';
import { getCurrentDate, timestampToDate } from '../utils/dateUtil';
import { v4 as uuidv4 } from 'uuid';

export const scheduleService = {
  getTutorSchedules: async (userId: string) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    const snapshot = await scheduleRepository.getSchedulesByTutorId(firestoreTutorReference).get();
    
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const now = getCurrentDate();
    
    return data.flatMap((schedule: any) =>
      schedule.slots?.filter((slot: any) => {
        return timestampToDate(slot.startTime) >= now;
      })
    );
  },

  getTutorSchedulesRealTime: (userId: string, callback: (schedules: any[]) => void) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    
    return scheduleRepository
      .getSchedulesByTutorId(firestoreTutorReference)
      .onSnapshot((snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        callback(data);
      });
  },

  addTimeSlot: async (userId: string, slotData: {
    day: string;
    startTime: string;
    endTime: string;
  }) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    
    const { getDateOccurrence } = await import('../utils/getDateOccurrence');
    const targetDate = getDateOccurrence(slotData.day as any);
    
    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    
    const [startHour, startMinute] = slotData.startTime.split(':').map(Number);
    const [endHour, endMinute] = slotData.endTime.split(':').map(Number);
    
    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    const hasConflict = await scheduleService.checkTimeConflict(
      userId, 
      startDate, 
      endDate
    );
    
    if (hasConflict) {
      throw new Error('This time slot overlaps with an existing schedule.');
    }
    
    const newSlotData = {
      id: uuidv4(),
      startTime: firestore.Timestamp.fromDate(startDate),
      endTime: firestore.Timestamp.fromDate(endDate),
    };
    
    const snapshot = await scheduleRepository.getSchedulesByTutorId(firestoreTutorReference).get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const existingSchedule = schedules.find(
      (schedule: any) =>
        schedule.tutorId.isEqual && schedule.tutorId.isEqual(firestoreTutorReference)
    );
    
    if (existingSchedule) {
      await scheduleRepository.addSlotToSchedule(existingSchedule.id, newSlotData);
    } else {
      await scheduleRepository.createSchedule({
        slots: [newSlotData],
        tutorId: firestoreTutorReference,
      });
    }
  },

  deleteTimeSlot: async (slotId: string, scheduleDocId: string) => {
    const scheduleDoc = await scheduleRepository.getScheduleById(scheduleDocId);
    
    if (!scheduleDoc.exists) {
      throw new Error('Schedule document not found');
    }
    
    const scheduleData = scheduleDoc.data();
    const scheduleSlots = scheduleData?.slots || [];
    
    const updatedSlots = scheduleSlots.filter((slot: any) => slot.id !== slotId);
    
    await scheduleRepository.updateScheduleSlots(scheduleDocId, updatedSlots);
  },

  checkTimeConflict: async (userId: string, startDate: Date, endDate: Date) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    const snapshot = await scheduleRepository.getSchedulesByTutorId(firestoreTutorReference).get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return schedules.some((schedule: any) =>
      schedule.slots?.some((slot: any) => {
        const existingStart = timestampToDate(slot.startTime);
        const existingEnd = timestampToDate(slot.endTime);
        
        return (
          (startDate >= existingStart && startDate < existingEnd) ||
          (endDate > existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        );
      })
    );
  },

  getAvailableTutors: async (currentUserId: string) => {
    const firestoreCurrentUserReference = firestore().collection('users').doc(currentUserId);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = scheduleRepository
        .getSchedulesExcludingTutor(firestoreCurrentUserReference)
        .onSnapshot(
          async (snapshot) => {
            try {
              const populated = await Promise.all(
                snapshot.docs.map(async (doc) => {
                  const data = doc.data();
                  const populatedData = await populateReferences(data);
                  return { id: doc.id, ...populatedData };
                })
              );
              resolve(populated);
            } catch (err) {
              reject(err);
            }
          },
          reject
        );
      
      return unsubscribe;
    });
  },
};
