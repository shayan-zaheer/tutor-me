import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Profile {
  bio: string;
  speciality: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
}

export interface TutorSchedule {
  id: string;
  tutorId: User;
  slots: ProcessedSlot[];
}


export interface Tutor {
  id: string;
  name: string;
  profile?: Profile;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Schedule {
  id?: string;
  tutorId: FirebaseFirestoreTypes.DocumentReference | string;
  slots: Slot[];
}

export interface Slot {
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime: FirebaseFirestoreTypes.Timestamp;
}

export interface BookedSlot extends Slot {
  price: number;
}

export interface Booking {
  id: string;
  tutor: User | FirebaseFirestoreTypes.DocumentReference;
  student: User | FirebaseFirestoreTypes.DocumentReference;
  schedule: Schedule | FirebaseFirestoreTypes.DocumentReference;
  bookedSlot: BookedSlot;
  ratings?: number;
  rating?: number;
  isPaid: boolean;
  review?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface User {
  id: string;
  name?: string;
  email: string | null;
  profile?: Profile;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  lastLoginAt: FirebaseFirestoreTypes.Timestamp;
}

export interface TutorWithSchedule extends User {
  id: string;
  schedule?: Schedule;
}

export interface QuickStat {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export interface ProcessedSlot extends Slot {
  id: string;
  scheduleId: string;
  day: string;
  isBooked: boolean;
}

export interface ScheduleData {
  id: string;
  tutorId: User;
  slots: ProcessedSlot[];
}

export interface BookingData {
  id: string;
  tutor?: { id: string };
  bookedSlot?: {
    startTime: FirebaseFirestoreTypes.Timestamp;
    endTime: FirebaseFirestoreTypes.Timestamp;
  };
}