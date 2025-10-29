'use client'

import { useState, useEffect } from 'react'
import type { OpeningHours } from '@/types'

interface OpeningHoursFormProps {
  garageId: string
  initialHours: OpeningHours[]
  onSave?: () => void
}

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// Generate time options (00:00 to 23:45 in 15-minute steps)
const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      options.push(`${h}:${m}`)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

// Generate hour options (00-23)
const generateHourOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    options.push(hour.toString().padStart(2, '0'))
  }
  return options
}

// Generate minute options (00, 15, 30, 45)
const generateMinuteOptions = () => {
  return ['00', '15', '30', '45']
}

const HOUR_OPTIONS = generateHourOptions()
const MINUTE_OPTIONS = generateMinuteOptions()

// Helper to split time string into hour and minute
const splitTime = (time: string | undefined): [string, string] => {
  if (!time) return ['09', '00']
  const [hour, minute] = time.split(':')
  return [hour || '09', minute || '00']
}

// Helper to combine hour and minute into time string
const combineTime = (hour: string, minute: string): string => {
  // Ensure zero-padding for HH:MM format
  const paddedHour = hour.padStart(2, '0')
  const paddedMinute = minute.padStart(2, '0')
  return `${paddedHour}:${paddedMinute}`
}

export default function OpeningHoursForm({
  garageId,
  initialHours,
  onSave,
}: OpeningHoursFormProps) {
  // Initialize state with all 7 days
  const [hours, setHours] = useState<OpeningHours[]>(() => {
    // Ensure we have all 7 days
    const daysMap = new Map<number, OpeningHours>()
    initialHours.forEach((h) => daysMap.set(h.dayOfWeek, h))
    
    const allDays: OpeningHours[] = []
    for (let day = 1; day <= 7; day++) {
      const existing = daysMap.get(day)
      if (existing) {
        allDays.push({ ...existing })
      } else {
        allDays.push({
          id: '',
          garageId: '',
          dayOfWeek: day,
          isOpen: false,
        })
      }
    }
    return allDays
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateDay = (dayOfWeek: number, updates: Partial<OpeningHours>) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
      )
    )
    setError(null)
    setSuccess(false)
  }

  const updateTime = (
    dayOfWeek: number,
    timeType: 'openTime' | 'closeTime',
    hour: string,
    minute: string
  ) => {
    const newTime = combineTime(hour, minute)
    updateDay(dayOfWeek, { [timeType]: newTime })
  }


  const toggleDay = (dayOfWeek: number) => {
    const day = hours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!day) return

    const newIsOpen = !day.isOpen
    updateDay(dayOfWeek, {
      isOpen: newIsOpen,
      // Reset times when disabling
      openTime: newIsOpen ? day.openTime || '09:00' : undefined,
      closeTime: newIsOpen ? day.closeTime || '17:00' : undefined,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSaving(true)

    // Validate times
    for (const hour of hours) {
      if (hour.isOpen) {
        if (!hour.openTime || !hour.closeTime) {
          setError(`Please set opening and closing times for ${DAY_NAMES[hour.dayOfWeek - 1]}`)
          setIsSaving(false)
          return
        }

        const [openHour, openMin] = hour.openTime.split(':').map(Number)
        const [closeHour, closeMin] = hour.closeTime.split(':').map(Number)
        
        const openMinutes = openHour * 60 + openMin
        const closeMinutes = closeHour * 60 + closeMin

        // Validate that close time is after open time (or handle next-day close)
        if (closeMinutes <= openMinutes && closeMinutes !== 0 && openMinutes !== 0) {
          // This is a next-day close, which is allowed
          // But warn if it seems like an error (e.g., 10:00 - 09:00)
          if (closeMinutes < openMinutes && openMinutes - closeMinutes > 60) {
            // Likely an error
            setError(`Closing time should be after opening time for ${DAY_NAMES[hour.dayOfWeek - 1]}`)
            setIsSaving(false)
            return
          }
        }
      }
    }

    try {
      // POST to API with admin secret
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_WRITE_SECRET
      if (!adminSecret) {
        throw new Error('Admin secret not configured')
      }

      // Format times to ensure HH:MM format
      const formattedHours = hours.map((h) => {
        const formatted: any = {
          dayOfWeek: h.dayOfWeek,
          isOpen: h.isOpen,
        }
        
        if (h.isOpen) {
          // Ensure times are in HH:MM format
          if (h.openTime) {
            const [hour, minute] = h.openTime.split(':')
            if (hour && minute) {
              formatted.openTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
            } else {
              formatted.openTime = null
            }
          } else {
            formatted.openTime = null
          }
          
          if (h.closeTime) {
            const [hour, minute] = h.closeTime.split(':')
            if (hour && minute) {
              formatted.closeTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
            } else {
              formatted.closeTime = null
            }
          } else {
            formatted.closeTime = null
          }
        } else {
          formatted.openTime = null
          formatted.closeTime = null
        }
        
        return formatted
      })

      const response = await fetch(`/api/opening-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          hours: formattedHours,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save opening hours')
      }

      setSuccess(true)
      if (onSave) {
        onSave()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opening hours')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Table/Grid Layout */}
      <div className="space-y-4">
        {/* Column Headers */}
        <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
          <div className="font-bold text-gray-900">Days</div>
          <div className="flex items-center gap-2">
            {/* Open header - aligns with start of Open time inputs */}
            <div className="font-bold text-gray-900">Open</div>
            {/* Invisible placeholder selects to match Open time width */}
            <div className="flex items-center gap-1 opacity-0 pointer-events-none">
              <select
                className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option>09</option>
              </select>
              <span>:</span>
              <select
                className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option>00</option>
              </select>
            </div>
            {/* Separator placeholder - matches the " > " separator */}
            <span className="text-transparent font-semibold"> &gt; </span>
            {/* Close header - aligns with Close hour dropdown, matching the close time structure */}
            <div className="flex items-center gap-1">
              <div className="font-bold text-gray-900">Close</div>
              {/* Invisible placeholder colon and minute select to match structure */}
              <span className="opacity-0 pointer-events-none">:</span>
              <select
                className="opacity-0 pointer-events-none border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem'
                }}
              >
                <option>00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Day Rows */}
        {hours.map((hour) => {
          const dayName = DAY_NAMES[hour.dayOfWeek - 1]
          const [openHour, openMinute] = splitTime(hour.openTime)
          const [closeHour, closeMinute] = splitTime(hour.closeTime)

          return (
            <div
              key={hour.dayOfWeek}
              className="grid grid-cols-[200px_1fr] gap-4 items-center"
            >
              {/* Day toggle button */}
              <button
                type="button"
                onClick={() => toggleDay(hour.dayOfWeek)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  hour.isOpen
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                {hour.isOpen && (
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <span>{dayName}</span>
              </button>

              {/* Time selects - only show if day is open */}
              {hour.isOpen ? (
                <div className="flex items-center gap-2">
                  {/* Open time */}
                  <div className="flex items-center gap-1">
                    <select
                      value={openHour}
                      onChange={(e) =>
                        updateTime(hour.dayOfWeek, 'openTime', e.target.value, openMinute)
                      }
                      className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-800">:</span>
                    <select
                      value={openMinute}
                      onChange={(e) =>
                        updateTime(hour.dayOfWeek, 'openTime', openHour, e.target.value)
                      }
                      className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Separator */}
                  <span className="text-gray-600 font-semibold"> &gt; </span>

                  {/* Close time */}
                  <div className="flex items-center gap-1">
                    <select
                      value={closeHour}
                      onChange={(e) =>
                        updateTime(hour.dayOfWeek, 'closeTime', e.target.value, closeMinute)
                      }
                      className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-800">:</span>
                    <select
                      value={closeMinute}
                      onChange={(e) =>
                        updateTime(hour.dayOfWeek, 'closeTime', closeHour, e.target.value)
                      }
                      className="border border-gray-300 rounded bg-gray-50 text-gray-800 px-3 py-2 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          Opening hours saved successfully!
        </div>
      )}

      {/* Save button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md transition-colors ${
            isSaving
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

