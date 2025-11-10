import firestore from '@react-native-firebase/firestore';
import { scheduleRepository } from '../repos/scheduleRepository';
import { populateReferences } from '../utils/populateReferences';
import { getCurrentDate, timestampToDate, getNextWeekdayOccurrence } from '../utils/dateUtil';
import { checkTimeConflict } from '../utils/checkTimeConflict';
import { bookingService } from './bookingService';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


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

  getTutorSlotsFormatted: (userId: string, callback: (slots: any[]) => void) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    
    return scheduleRepository
      .getSchedulesByTutorId(firestoreTutorReference)
      .onSnapshot((snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        
        const now = getCurrentDate();
        const formattedSlots = data.flatMap((schedule: any) =>
          schedule.slots?.filter((slot: any) => {
            return timestampToDate(slot.startTime) >= now;
          }).map((slot: any) => ({
            id: slot.id || generateId(),
            scheduleId: schedule.id,
            time: `${timestampToDate(slot.startTime).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${timestampToDate(slot.endTime).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            day: timestampToDate(slot.startTime).toLocaleDateString('en-GB', { 
              weekday: 'long' 
            }),
            difference: `${
              timestampToDate(slot.endTime).getHours() -
              timestampToDate(slot.startTime).getHours()
            } hours`,
            originalSlot: slot,
          })) || []
        );
        
        callback(formattedSlots);
      });
  },

  addTimeSlot: async (userId: string, slotData: {
    day: string;
    startTime: string;
    endTime: string;
    hourlyRate?: number;
  }) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    const targetDate = getNextWeekdayOccurrence(slotData.day as any);
    
    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    
    const [startHour, startMinute] = slotData.startTime.split(':').map(Number);
    const [endHour, endMinute] = slotData.endTime.split(':').map(Number);
    
    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    await scheduleService.validateAvailabilityCreation(
      userId,
      targetDate,
      startDate,
      endDate,
      slotData.hourlyRate
    );

    const durationMilliseconds = endDate.getTime() - startDate.getTime();
    const durationHours = durationMilliseconds / (1000 * 60 * 60);
    const price = slotData.hourlyRate! * durationHours;
    
    const newSlotData = {
      id: generateId(),
      startTime: firestore.Timestamp.fromDate(startDate),
      endTime: firestore.Timestamp.fromDate(endDate),
      price: price,
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

  deleteTimeSlotByDetails: async (userId: string, slotToDelete: { time: string, day: string }) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    const snapshot = await scheduleRepository.getSchedulesByTutorId(firestoreTutorReference).get();
    
    for (const doc of snapshot.docs) {
      const schedule = doc.data();
      const receivedSlots = schedule.slots || [];

      const updatedSlots = receivedSlots.filter((slot: any) => {
        const start = timestampToDate(slot.startTime).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const end = timestampToDate(slot.endTime).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const time = `${start} - ${end}`;
        const day = timestampToDate(slot.startTime).toLocaleDateString('en-GB', { 
          weekday: 'long' 
        });

        return !(time === slotToDelete.time && day === slotToDelete.day);
      });

      if (updatedSlots.length !== receivedSlots.length) {
        await scheduleRepository.updateScheduleSlots(doc.id, updatedSlots);
        return;
      }
    }
  },

  validateAvailabilityCreation: async (userId: string, targetDate: Date, startDate: Date, endDate: Date, hourlyRate?: number) => {
    // Validate hourly rate
    if (!hourlyRate || hourlyRate <= 0) {
      throw new Error('Please set your hourly rate in your profile first.');
    }

    // Check if the selected time has already passed for today
    const now = getCurrentDate();
    const isToday = targetDate.toDateString() === now.toDateString();
    if (isToday && startDate <= now) {
      throw new Error('Cannot create a time slot for a time that has already passed today.');
    }

    // Check if tutor has existing schedule conflicts
    const hasScheduleConflict = await scheduleService.checkTimeConflict(userId, startDate, endDate);
    if (hasScheduleConflict) {
      throw new Error('You already have an availability slot during this time period.');
    }

    // Check if tutor has student booking conflicts (tutor studying from someone else)
    const hasStudentBookingConflict = await bookingService.checkStudentBookingConflict(
      userId,
      firestore.Timestamp.fromDate(startDate),
      firestore.Timestamp.fromDate(endDate)
    );
    if (hasStudentBookingConflict) {
      throw new Error('You have a learning session booked during this time. Please choose a different time slot.');
    }

    return true;
  },

  checkTimeConflict: async (userId: string, startDate: Date, endDate: Date) => {
    const firestoreTutorReference = firestore().collection('users').doc(userId);
    const snapshot = await scheduleRepository.getSchedulesByTutorId(firestoreTutorReference).get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return schedules.some((schedule: any) =>
      schedule.slots?.some((slot: any) => {
        const existingStart = timestampToDate(slot.startTime);
        const existingEnd = timestampToDate(slot.endTime);
        
        return checkTimeConflict(existingStart, existingEnd, startDate, endDate);
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
