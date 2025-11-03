import { DAYS_OF_WEEK } from '../constants/days';
import { getCurrentDate } from './dateUtil';

export function getDateOccurrence(dayName: string): Date {
  const jsWeekDays = ["Sunday", ...DAYS_OF_WEEK];

  const today = getCurrentDate();
  const todayIndex = today.getDay();
  const targetIndex = jsWeekDays.indexOf(dayName);

  if (targetIndex === -1) throw new Error("Invalid day name");

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  return nextDate;
}