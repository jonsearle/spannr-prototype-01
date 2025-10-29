import { getGarageBySlug } from '@/lib/supabase/queries'
import { isGarageOpen } from '@/lib/utils/timezone'
import OpenStatusBadge from '@/components/garage/OpenStatusBadge'
import { notFound } from 'next/navigation'
import type { OpeningHours } from '@/types'

interface PageProps {
  params: { slug: string }
}

async function fetchOpeningHours(slug: string): Promise<OpeningHours[]> {
  // In server components, we can use relative URLs
  // For better performance in production, you could use getOpeningHoursByGarageId directly
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/garages/${slug}/opening-hours`, {
    cache: 'no-store', // Always fetch fresh data for accurate status
  })
  
  if (!response.ok) {
    return []
  }
  
  return response.json()
}

export default async function GaragePage({ params }: PageProps) {
  const garage = await getGarageBySlug(params.slug)

  if (!garage) {
    notFound()
  }

  const openingHours = await fetchOpeningHours(params.slug)
  const isOpenNow = isGarageOpen(openingHours, garage.timezone)

  return (
    <div className="min-h-screen bg-gray-50">
      <OpenStatusBadge isOpen={isOpenNow} />
      
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {garage.businessName}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {garage.oneLineDescription}
        </p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            About Us
          </h2>
          <p className="text-gray-700 whitespace-pre-line">
            {garage.aboutText}
          </p>
        </div>
      </div>
    </div>
  )
}

