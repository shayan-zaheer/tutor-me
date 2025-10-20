import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Profile {
  bio: string;
  speciality: string;
  rating: number;
  totalReviews: number;
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
  price: number;
}

export interface Booking {
  tutor: User;
  student: User;
  schedule: Schedule;
  ratings: number;
  isPaid: boolean;
  review: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface User {
  id: string;
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