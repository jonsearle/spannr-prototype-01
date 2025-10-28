// TypeScript interfaces based on the PRD data model
// These will be refined during feature development

export interface Garage {
  id: string
  slug: string
  businessName: string
  oneLineDescription: string
  aboutText: string
  heroImageUrl?: string
  timezone: string
  
  // Contact details
  addressLine1: string
  addressLine2?: string
  addressLine3?: string
  addressLine4?: string
  postcode: string
  phone: string
  email: string
  
  // Reviews link
  googleReviewsUrl?: string
  
  // Callback notifications
  callbackContactName: string
  callbackContactEmail: string
  
  createdAt: string
  updatedAt: string
}

export interface OpeningHours {
  id: string
  garageId: string
  dayOfWeek: number // 1 = Monday, 7 = Sunday
  isOpen: boolean
  openTime?: string // HH:MM format
  closeTime?: string // HH:MM format
}

export interface Service {
  id: string
  garageId: string
  name: string
  description: string
  position: number
}

export interface Review {
  id: string
  garageId: string
  customerName: string
  reviewText: string
  stars: number // 1-5
  position: number
}

// Derived/computed types
export interface GarageWithDetails extends Garage {
  openingHours: OpeningHours[]
  services: Service[]
  reviews: Review[]
  isOpenNow: boolean
}

// Form data types
export interface CallbackRequest {
  customerName: string
  customerPhone: string
}

export interface AdminGarageData {
  businessName: string
  oneLineDescription: string
  aboutText: string
  heroImageUrl?: string
  timezone: string
  addressLine1: string
  addressLine2?: string
  addressLine3?: string
  addressLine4?: string
  postcode: string
  phone: string
  email: string
  googleReviewsUrl?: string
  callbackContactName: string
  callbackContactEmail: string
}
