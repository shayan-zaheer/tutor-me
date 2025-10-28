import { DAYS_OF_WEEK } from '../constants/days';

export function getDateOccurrence(dayName: string): Date {
  // Note: JavaScript Date.getDay() returns 0 for Sunday, 1 for Monday, etc.
  // But our DAYS_OF_WEEK starts with Monday. So we need to adjust.
  const jsWeekDays = ["Sunday", ...DAYS_OF_WEEK];

  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = jsWeekDays.indexOf(dayName);

  if (targetIndex === -1) throw new Error("Invalid day name");

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  return nextDate;
}
