import { supabaseAdmin } from './client'
import type { Garage, OpeningHours } from '@/types'

/**
 * Get garage by slug (legacy, for compatibility)
 */
export async function getGarageBySlug(slug: string): Promise<Garage | null> {
  const { data, error } = await supabaseAdmin
    .from('garages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw error
  }

  // Map database columns (snake_case) to TypeScript interface (camelCase)
  return {
    id: data.id,
    slug: data.slug,
    businessName: data.business_name,
    oneLineDescription: data.one_line_description,
    aboutText: data.about_text,
    heroImageUrl: data.hero_image_url,
    timezone: data.timezone,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    addressLine3: data.address_line3,
    addressLine4: data.address_line4,
    postcode: data.postcode,
    phone: data.phone,
    email: data.email,
    googleReviewsUrl: data.google_reviews_url,
    callbackContactName: data.callback_contact_name,
    callbackContactEmail: data.callback_contact_email,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as Garage
}

/**
 * Get the single garage (for prototype - assumes only one garage exists)
 */
export async function getSingleGarage(): Promise<Garage | null> {
  const { data, error } = await supabaseAdmin
    .from('garages')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw error
  }

  // Map database columns (snake_case) to TypeScript interface (camelCase)
  return {
    id: data.id,
    slug: data.slug,
    businessName: data.business_name,
    oneLineDescription: data.one_line_description,
    aboutText: data.about_text,
    heroImageUrl: data.hero_image_url,
    timezone: data.timezone,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    addressLine3: data.address_line3,
    addressLine4: data.address_line4,
    postcode: data.postcode,
    phone: data.phone,
    email: data.email,
    googleReviewsUrl: data.google_reviews_url,
    callbackContactName: data.callback_contact_name,
    callbackContactEmail: data.callback_contact_email,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as Garage
}

/**
 * Get opening hours for a garage
 * Returns array of 7 days (Monday = 1, Sunday = 7)
 */
export async function getOpeningHoursByGarageId(
  garageId: string
): Promise<OpeningHours[]> {
  const { data, error } = await supabaseAdmin
    .from('opening_hours')
    .select('*')
    .eq('garage_id', garageId)
    .order('day_of_week', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []).map((row) => ({
    id: row.id,
    garageId: row.garage_id,
    dayOfWeek: row.day_of_week,
    isOpen: row.is_open,
    openTime: row.open_time || undefined,
    closeTime: row.close_time || undefined,
  }))
}

/**
 * Upsert opening hours for a garage
 * Accepts array of 7 days (should include all days 1-7)
 */
export async function upsertOpeningHours(
  garageId: string,
  hours: Omit<OpeningHours, 'id' | 'garageId'>[]
): Promise<OpeningHours[]> {
  // Prepare data for upsert
  const dataToUpsert = hours.map((hour) => ({
    garage_id: garageId,
    day_of_week: hour.dayOfWeek,
    is_open: hour.isOpen,
    open_time: hour.openTime || null,
    close_time: hour.closeTime || null,
  }))

  // Use upsert with onConflict to handle duplicates
  const { data, error } = await supabaseAdmin
    .from('opening_hours')
    .upsert(dataToUpsert, {
      onConflict: 'garage_id,day_of_week',
    })
    .select()

  if (error) {
    throw error
  }

  return (data || []).map((row) => ({
    id: row.id,
    garageId: row.garage_id,
    dayOfWeek: row.day_of_week,
    isOpen: row.is_open,
    openTime: row.open_time || undefined,
    closeTime: row.close_time || undefined,
  }))
}

