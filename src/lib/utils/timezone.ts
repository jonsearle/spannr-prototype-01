import { formatInTimeZone } from 'date-fns-tz'

// Timezone utilities for garage opening hours
export const getCurrentTimeInTimezone = (timezone: string) => {
  return new Date()
}

export const formatTimeInTimezone = (date: Date, timezone: string, format: string = 'HH:mm') => {
  return formatInTimeZone(date, timezone, format)
}

export const isGarageOpen = (openingHours: any[], timezone: string) => {
  // Implementation will be added during feature development
  return false
}

// Common timezone options for UK garages
export const UK_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Belfast', label: 'Belfast (GMT/BST)' },
] as const
