import {
  startOfWeek,
  getWeek,
  addWeeks,
  format,
  addDays,
  getYear,
  setWeek,
  setYear,
  startOfYear,
} from 'date-fns'

/**
 * Get the current ISO week number (1-53)
 * Weeks start on Monday
 */
export function getCurrentWeekNumber(): number {
  return getWeek(new Date(), { weekStartsOn: 1, firstWeekContainsDate: 4 })
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return getYear(new Date())
}

/**
 * Get the Monday of a specific week number and year
 */
export function getMondayOfWeek(weekNumber: number, year: number): Date {
  const yearStart = startOfYear(new Date(year, 0, 1))
  let date = setWeek(yearStart, weekNumber, {
    weekStartsOn: 1,
    firstWeekContainsDate: 4,
  })
  date = setYear(date, year)
  return startOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Get array of dates for the school week (Mon-Fri)
 */
export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(monday, i))
}

/**
 * Format a week range as "MMM d - MMM d, yyyy"
 * Example: "Nov 6 - Nov 10, 2023"
 */
export function formatWeekRange(monday: Date): string {
  const friday = addDays(monday, 4)
  const mondayMonth = format(monday, 'MMM')
  const fridayMonth = format(friday, 'MMM')

  if (mondayMonth === fridayMonth) {
    // Same month: "Nov 6-10, 2023"
    return `${format(monday, 'MMM d')}-${format(friday, 'd, yyyy')}`
  } else {
    // Different months: "Nov 27 - Dec 1, 2023"
    return `${format(monday, 'MMM d')} - ${format(friday, 'MMM d, yyyy')}`
  }
}

/**
 * Get the next week number and year
 * Handles year rollover (week 52/53 -> week 1 of next year)
 */
export function getNextWeek(weekNumber: number, year: number): {
  weekNumber: number
  year: number
} {
  const currentMonday = getMondayOfWeek(weekNumber, year)
  const nextMonday = addWeeks(currentMonday, 1)
  const nextWeekNumber = getWeek(nextMonday, {
    weekStartsOn: 1,
    firstWeekContainsDate: 4,
  })
  const nextYear = getYear(nextMonday)

  return {
    weekNumber: nextWeekNumber,
    year: nextYear,
  }
}

/**
 * Format a date as ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get day name from day of week number (1-5)
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return days[dayOfWeek - 1] || ''
}

/**
 * Get short day name from day of week number (1-5)
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return days[dayOfWeek - 1] || ''
}
