import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import type { OpeningHours } from '@/types'

// Timezone utilities for garage opening hours
export const getCurrentTimeInTimezone = (timezone: string) => {
  return new Date()
}

export const formatTimeInTimezone = (date: Date, timezone: string, format: string = 'HH:mm') => {
  return formatInTimeZone(date, timezone, format)
}

/**
 * Check if garage is currently open based on opening hours and timezone
 * @param openingHours Array of opening hours (should include all 7 days)
 * @param timezone IANA timezone string (e.g., 'Europe/London')
 * @returns true if garage is open, false otherwise
 */
export const isGarageOpen = (openingHours: OpeningHours[], timezone: string): boolean => {
  if (!openingHours || openingHours.length === 0) {
    return false
  }

  // Get current time in garage's timezone
  const now = new Date()
  const zonedTime = toZonedTime(now, timezone)
  
  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // Convert to our format (1 = Monday, 7 = Sunday)
  const dayOfWeek = zonedTime.getDay()
  const dayOfWeekFormatted = dayOfWeek === 0 ? 7 : dayOfWeek

  // Find opening hours for today
  const todayHours = openingHours.find((h) => h.dayOfWeek === dayOfWeekFormatted)
  
  if (!todayHours || !todayHours.isOpen) {
    return false
  }

  // If no times specified, assume closed
  if (!todayHours.openTime || !todayHours.closeTime) {
    return false
  }

  // Parse time strings (HH:MM format)
  const [openHour, openMinute] = todayHours.openTime.split(':').map(Number)
  const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number)

  // Create time objects for today in garage timezone
  const openTime = new Date(zonedTime)
  openTime.setHours(openHour, openMinute, 0, 0)

  const closeTime = new Date(zonedTime)
  closeTime.setHours(closeHour, closeMinute, 0, 0)

  // Handle case where close time is next day (e.g., 23:00 - 01:00)
  if (closeTime < openTime) {
    closeTime.setDate(closeTime.getDate() + 1)
  }

  // Check if current time is between open and close time
  return zonedTime >= openTime && zonedTime < closeTime
}

// Common timezone options for UK garages
export const UK_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Belfast', label: 'Belfast (GMT/BST)' },
] as const
