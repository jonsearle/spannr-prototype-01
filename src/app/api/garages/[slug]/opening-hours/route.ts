import { NextRequest, NextResponse } from 'next/server'
import { getGarageBySlug, getOpeningHoursByGarageId, upsertOpeningHours } from '@/lib/supabase/queries'
import type { OpeningHours } from '@/types'

/**
 * GET /api/garages/[slug]/opening-hours
 * Returns opening hours for a garage (public access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const garage = await getGarageBySlug(params.slug)
    
    if (!garage) {
      return NextResponse.json(
        { error: 'Garage not found' },
        { status: 404 }
      )
    }

    const hours = await getOpeningHoursByGarageId(garage.id)
    
    // Ensure we return all 7 days, filling in missing days with defaults
    const daysMap = new Map<number, OpeningHours>()
    hours.forEach((h) => daysMap.set(h.dayOfWeek, h))
    
    const allDays: OpeningHours[] = []
    for (let day = 1; day <= 7; day++) {
      const existing = daysMap.get(day)
      if (existing) {
        allDays.push(existing)
      } else {
        // Create default entry for missing day
        allDays.push({
          id: '',
          garageId: garage.id,
          dayOfWeek: day,
          isOpen: false,
        })
      }
    }

    return NextResponse.json(allDays)
  } catch (error) {
    console.error('Error fetching opening hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opening hours' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/garages/[slug]/opening-hours
 * Upserts opening hours for a garage (protected by ADMIN_WRITE_SECRET)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check admin secret
    const adminSecret = process.env.ADMIN_WRITE_SECRET
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get secret from header or body
    const body = await request.json()
    const providedSecret = request.headers.get('x-admin-secret') || body.secret
    
    if (providedSecret !== adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const garage = await getGarageBySlug(params.slug)
    
    if (!garage) {
      return NextResponse.json(
        { error: 'Garage not found' },
        { status: 404 }
      )
    }

    // Validate hours array
    const hours: Omit<OpeningHours, 'id' | 'garageId'>[] = body.hours
    
    if (!Array.isArray(hours) || hours.length !== 7) {
      return NextResponse.json(
        { error: 'Invalid hours format. Expected array of 7 days.' },
        { status: 400 }
      )
    }

    // Validate each day
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    
    for (const hour of hours) {
      // Validate day_of_week
      if (!Number.isInteger(hour.dayOfWeek) || hour.dayOfWeek < 1 || hour.dayOfWeek > 7) {
        return NextResponse.json(
          { error: `Invalid day_of_week: ${hour.dayOfWeek}. Must be 1-7.` },
          { status: 400 }
        )
      }

      // Validate is_open
      if (typeof hour.isOpen !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid is_open for day ${hour.dayOfWeek}. Must be boolean.` },
          { status: 400 }
        )
      }

      // If open, validate times
      if (hour.isOpen) {
        if (!hour.openTime || !hour.closeTime) {
          return NextResponse.json(
            { error: `Day ${hour.dayOfWeek} is open but missing open_time or close_time` },
            { status: 400 }
          )
        }

        if (!timeRegex.test(hour.openTime) || !timeRegex.test(hour.closeTime)) {
          return NextResponse.json(
            { error: `Invalid time format for day ${hour.dayOfWeek}. Use HH:MM format.` },
            { status: 400 }
          )
        }

        // Validate open_time < close_time (or handle next-day close)
        const [openHour, openMin] = hour.openTime.split(':').map(Number)
        const [closeHour, closeMin] = hour.closeTime.split(':').map(Number)
        
        const openMinutes = openHour * 60 + openMin
        const closeMinutes = closeHour * 60 + closeMin
        
        // Allow next-day closing (e.g., 23:00 - 01:00)
        // But if close is earlier than open, assume it's next day
        if (closeMinutes <= openMinutes && closeMinutes !== 0) {
          // This is valid (next day close), but we'll still allow it
          // The isGarageOpen function handles this case
        }
      }
    }

    // Upsert hours
    const updatedHours = await upsertOpeningHours(garage.id, hours)

    return NextResponse.json(updatedHours)
  } catch (error) {
    console.error('Error updating opening hours:', error)
    return NextResponse.json(
      { error: 'Failed to update opening hours' },
      { status: 500 }
    )
  }
}

