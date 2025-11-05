import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { populateReferences } from '../utils/populateReferences';
import { 
  getCurrentDate,
  timestampToDate,
  timestampToMillis,
  formatSlotDate
} from '../utils/dateUtil';
import { BookingData, ScheduleData, ProcessedSlot } from '../types/index';

const buildBookedSlots = (bookingsData: BookingData[]): Set<string> => {
  const bookedSlots = new Set<string>();
  
  bookingsData.forEach(booking => {
    if (!booking?.bookedSlot) return;
    
    const tutorId = booking.tutor?.id;
    const start = timestampToMillis(booking.bookedSlot.startTime);
    const end = timestampToMillis(booking.bookedSlot.endTime);
    
    if (tutorId && start && end) {
      bookedSlots.add(`${tutorId}-${start}-${end}`);
    }
  });
  
  return bookedSlots;
};

const processScheduleSlots = (
  schedule: ScheduleData, 
  bookedSlots: Set<string>, 
  now: Date
): ProcessedSlot[] => {
  const tutorId = schedule.tutorId.id;
  
  return (schedule.slots || [])
    .filter(slot => timestampToDate(slot.startTime) >= now)
    .map((slot, index) => {
      const startMillis = timestampToMillis(slot.startTime);
      const endMillis = timestampToMillis(slot.endTime);
      const slotKey = `${tutorId}-${startMillis}-${endMillis}`;
      const isBooked = bookedSlots.has(slotKey);

      return {
        ...slot,
        id: `${schedule.id}-${index}`,
        scheduleId: schedule.id,
        day: formatSlotDate(slot.startTime),
        isBooked,
      };
    });
};

const filterAvailableSchedules = (
  schedulesData: ScheduleData[], 
  bookingsData: BookingData[]
): ScheduleData[] => {
  const now = getCurrentDate();
  const bookedSlots = buildBookedSlots(bookingsData);

  return schedulesData
    .map(schedule => {
      const slotsWithStatus = processScheduleSlots(schedule, bookedSlots, now);
      return { ...schedule, slots: slotsWithStatus };
    })
    .filter(schedule => schedule.slots.length > 0);
};

export const useTutorSchedules = (currentUserId: string | undefined) => {
  const [allTutors, setAllTutors] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    setIsLoading(true);
    const firestoreCurrentUserReference = firestore().collection('users').doc(currentUserId);

    let latestSchedules: ScheduleData[] = [];
    let latestBookings: BookingData[] = [];

    const processAndSetTutors = (
      schedulesData: ScheduleData[], 
      bookingsData: BookingData[]
    ) => {
      try {
        const tutorsWithBookingStatus = filterAvailableSchedules(schedulesData, bookingsData);
        setAllTutors(tutorsWithBookingStatus);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in processing schedules/bookings:', err);
        setIsLoading(false);
      }
    };

    const schedulesUnsub = firestore()
      .collection('schedules')
      .where('tutorId', '!=', firestoreCurrentUserReference)
      .onSnapshot(async schedulesSnapshot => {
        try {
          const populated = await populateReferences(schedulesSnapshot);
          latestSchedules = populated;
          processAndSetTutors(latestSchedules, latestBookings);
        } catch (err) {
          console.error('Error populating schedules:', err);
          setIsLoading(false);
        }
      });

    const bookingsUnsub = firestore()
      .collection('bookings')
      .onSnapshot(bookingsSnapshot => {
        try {
          latestBookings = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          processAndSetTutors(latestSchedules, latestBookings);
        } catch (err) {
          console.error('Error reading bookings:', err);
          setIsLoading(false);
        }
      });

    return () => {
      schedulesUnsub();
      bookingsUnsub();
    };
  }, [currentUserId]);

  return { allTutors, isLoading };
};