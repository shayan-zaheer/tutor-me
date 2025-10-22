export function getDateOccurrence(dayName: string): Date {
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];

  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = daysOfWeek.indexOf(dayName);

  if (targetIndex === -1) throw new Error("Invalid day name");

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  return nextDate;
}
