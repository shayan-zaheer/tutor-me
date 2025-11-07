import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface DateFormatOptions {
  includeYear?: boolean;
  includeTime?: boolean;
  shortMonth?: boolean;
  shortDay?: boolean;
}

export const timestampToDate = (timestamp: FirebaseFirestoreTypes.Timestamp): Date => {
  return timestamp.toDate();
};

export const timestampToMillis = (timestamp: FirebaseFirestoreTypes.Timestamp): number => {
  return timestamp.toMillis();
};

export const formatDate = (
  date: Date | FirebaseFirestoreTypes.Timestamp,
  options: DateFormatOptions = {}
): string => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const { includeYear = true, shortMonth = false, shortDay = false } = options;

  const day = shortDay 
    ? actualDate.toLocaleDateString('en-GB', { weekday: 'short' })
    : actualDate.toLocaleDateString('en-GB', { weekday: 'long' });

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: shortMonth ? 'short' : 'long',
  };

  if (includeYear) {
    dateOptions.year = 'numeric';
  }

  const formattedDate = actualDate.toLocaleDateString('en-GB', dateOptions);
  
  return `${day}, ${formattedDate}`;
};

export const formatTime = (date: Date | FirebaseFirestoreTypes.Timestamp): string => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  return actualDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDateTime = (
  date: Date | FirebaseFirestoreTypes.Timestamp,
  options: DateFormatOptions = {}
): string => {
  const dateStr = formatDate(date, options);
  const timeStr = formatTime(date);
  return `${dateStr} at ${timeStr}`;
};

export const formatSlotDate = (date: Date | FirebaseFirestoreTypes.Timestamp): string => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const day = actualDate.toLocaleDateString('en-GB', { weekday: 'short' });
  const dateStr = actualDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
  return `${day} ${dateStr}`;
};

export const formatDayName = (
  date: Date | FirebaseFirestoreTypes.Timestamp, 
  format: 'short' | 'long' = 'long'
): string => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  return actualDate.toLocaleDateString('en-GB', { 
    weekday: format 
  });
};

export const formatTimeRange = (
  startTime: Date | FirebaseFirestoreTypes.Timestamp,
  endTime: Date | FirebaseFirestoreTypes.Timestamp
): string => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return `${start} - ${end}`;
};

export const formatBookingDisplay = (
  startTime: Date | FirebaseFirestoreTypes.Timestamp,
  endTime: Date | FirebaseFirestoreTypes.Timestamp
): string => {
  const dateStr = formatDate(startTime);
  const timeRange = formatTimeRange(startTime, endTime);
  return `${dateStr} at ${timeRange}`;
};

export const getRelativeTime = (date: Date | FirebaseFirestoreTypes.Timestamp): string => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const now = new Date();
  const diffInMs = actualDate.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInMinutes) < 1) {
    return 'now';
  } else if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 
      ? `in ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`
      : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ago`;
  } else if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 
      ? `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`
      : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
  } else {
    return diffInDays > 0 
      ? `in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`
      : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
  }
};

export const isToday = (date: Date | FirebaseFirestoreTypes.Timestamp): boolean => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const today = new Date();
  return actualDate.toDateString() === today.toDateString();
};

export const isTomorrow = (date: Date | FirebaseFirestoreTypes.Timestamp): boolean => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return actualDate.toDateString() === tomorrow.toDateString();
};

export const isPast = (date: Date | FirebaseFirestoreTypes.Timestamp): boolean => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  return actualDate < new Date();
};

export const isFuture = (date: Date | FirebaseFirestoreTypes.Timestamp): boolean => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  return actualDate > new Date();
};

export const formatSmartDate = (date: Date | FirebaseFirestoreTypes.Timestamp): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else {
    return formatDate(date, { shortMonth: true, shortDay: true });
  }
};

export const formatBookingCardDisplay = (
  startTime: Date | FirebaseFirestoreTypes.Timestamp,
  endTime: Date | FirebaseFirestoreTypes.Timestamp
): string => {
  const smartDate = formatSmartDate(startTime);
  const timeRange = formatTimeRange(startTime, endTime);
  return `${smartDate} at ${timeRange}`;
};

export const getCurrentDate = (): Date => {
  return new Date();
};

export const isWithinTimeThreshold = (
  date: Date | FirebaseFirestoreTypes.Timestamp,
  thresholdMinutes: number = 15
): boolean => {
  const actualDate = date instanceof Date ? date : timestampToDate(date);
  const now = getCurrentDate().getTime();
  const targetTime = actualDate.getTime();
  const thresholdMs = thresholdMinutes * 60 * 1000;
  
  return targetTime - now <= thresholdMs;
};

export const compareDates = (
  date1: Date | FirebaseFirestoreTypes.Timestamp,
  date2: Date | FirebaseFirestoreTypes.Timestamp
): number => {
  const actualDate1 = date1 instanceof Date ? date1 : timestampToDate(date1);
  const actualDate2 = date2 instanceof Date ? date2 : timestampToDate(date2);
  
  if (actualDate1 < actualDate2) return -1;
  if (actualDate1 > actualDate2) return 1;
  return 0;
};

export const sortBookingsByDate = <T extends { bookedSlot: { startTime: FirebaseFirestoreTypes.Timestamp } }>(
  bookings: T[]
): T[] => {
  return [...bookings].sort((a, b) => 
    compareDates(a.bookedSlot.startTime, b.bookedSlot.startTime)
  );
};

export const calculateSlotPrice = (
  startTime: FirebaseFirestoreTypes.Timestamp, 
  endTime: FirebaseFirestoreTypes.Timestamp, 
  hourlyRate: number
): number => {
  const start = timestampToDate(startTime);
  const end = timestampToDate(endTime);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.round(durationHours * hourlyRate);
};

export default {
  timestampToDate,
  timestampToMillis,
  formatDate,
  formatTime,
  formatDateTime,
  formatSlotDate,
  formatDayName,
  formatTimeRange,
  formatBookingDisplay,
  formatBookingCardDisplay,
  formatSmartDate,
  getRelativeTime,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  getCurrentDate,
  isWithinTimeThreshold,
  compareDates,
  sortBookingsByDate,
  calculateSlotPrice,
};